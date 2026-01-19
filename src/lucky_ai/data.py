from pathlib import Path
import os
import pandas as pd
import torch
import pytorch_lightning as pl
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizerFast
from datasets import load_dataset
from typing import Optional
import typer

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")


class LuckyDataset(Dataset):
    """Dataset with questions and boolean dilemmas."""

    def __init__(self, train: bool = True, data_dir: str = "data/processed") -> None:
        super().__init__()
        self.mode = "train" if train else "test"
        self.data_dir = Path(data_dir)
        self.load_data()

    def load_data(self) -> None:
        """Load questions (strings) and targets (bool) from disk."""

        self.questions, self.target = [], []

        if not self.data_dir.exists():
            raise FileNotFoundError(f"Data directory not found: {self.data_dir.absolute()}")

        for f in os.listdir(self.data_dir):
            if self.mode not in f:
                continue
            df = pd.read_parquet(self.data_dir / f)
            self.questions.extend(df["input"].astype(str).tolist())
            self.target.extend(df["label"].astype(bool).tolist())

    def __getitem__(self, idx: int) -> tuple[str, bool]:
        """Return question (string) and target (bool)."""
        question = self.questions[idx]
        target = self.target[idx]
        return question, target

    def __len__(self) -> int:
        """Return the number of questions in the dataset."""
        return len(self.questions)


class LuckyDataModule(pl.LightningDataModule):
    """Bridges raw strings to BERT tensors using a fast tokenizer"""

    def __init__(
        self,
        model_name: str = "bert-base-uncased",
        batch_size: int = 16,
        num_workers: int = 0,
        data_dir: str = "data/processed",
    ) -> None:
        super().__init__()
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.tokenizer = BertTokenizerFast.from_pretrained(model_name)
        self.data_dir = data_dir

    def setup(self, stage: Optional[str] = None) -> None:
        """Initializes the datasets"""
        self.train_set = LuckyDataset(train=True, data_dir=self.data_dir)
        self.test_set = LuckyDataset(train=False, data_dir=self.data_dir)

    def collate_fn(self, batch: list[tuple[str, bool]]) -> dict[str, torch.Tensor]:
        """Tokenizes text and converts labels to tensors for the model"""
        texts = [item[0] for item in batch]
        labels = [item[1] for item in batch]

        encodings = self.tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=128)

        return {
            "input_ids": encodings["input_ids"],
            "attention_mask": encodings["attention_mask"],
            "labels": torch.tensor(labels).long(),
        }

    def train_dataloader(self) -> DataLoader:
        return DataLoader(
            self.train_set,
            batch_size=self.batch_size,
            collate_fn=self.collate_fn,
            shuffle=True,
            num_workers=self.num_workers,
        )

    def val_dataloader(self) -> DataLoader:
        return DataLoader(self.test_set, batch_size=self.batch_size, collate_fn=self.collate_fn, num_workers=0)


app = typer.Typer()


@app.command()
def preprocess(
    subset: str = "all",
) -> None:
    """
    Preprocess datasets and store them as parquet files.

    subset options:
    - all           : run all preprocessors
    - commonsense   : ETHICS commonsense dataset
    - justice       : ETHICS justice dataset
    - strategyqa    : StrategyQA dataset
    - boolq         : Google BoolQ dataset
    """

    print("Preprocessing data...")

    if subset == "all" or subset == "commonsense":
        preprocess_commonsense()
    if subset == "all" or subset == "justice":
        preprocess_justice()
    if subset == "all" or subset == "strategyqa":
        preprocess_strategyQA()
    if subset == "all" or subset == "boolq":
        preprocess_boolq()


def preprocess_boolq() -> None:
    "Preprocess boolean questions from the BoolQ dataset."
    print("Preprocessing boolq dataset...")
    ds = load_dataset("google/boolq")

    ds["test"] = ds.pop("validation")
    # Extract train and validation splits
    for split in ["train", "test"]:
        df = ds[split].to_pandas()
        # Keep only 'question' and 'answer' columns
        df = df[["question", "answer"]]
        df.rename(columns={"question": "input", "answer": "label"}, inplace=True)

        out_path = PROCESSED_DIR / f"boolq_{split}.parquet"
        df.to_parquet(out_path, index=False)
        print(f"Saved {out_path}")


def preprocess_strategyQA() -> None:
    "Preprocess QA data from the StrategyQA dataset."
    print("Preprocessing strategyqa dataset...")

    ds = load_dataset("ChilleD/StrategyQA")
    # Extract train and test splits
    for split in ["train", "test"]:
        df = ds[split].to_pandas()
        # Keep only 'question' and 'answer' columns
        df = df[["question", "answer"]]
        df.rename(columns={"question": "input", "answer": "label"}, inplace=True)

        out_path = PROCESSED_DIR / f"strategyqa_{split}.parquet"
        df.to_parquet(out_path, index=False)
        print(f"Saved {out_path}")


def preprocess_commonsense() -> None:
    "Preprocess commonsense data from ETHICS dataset."
    print("Preprocessing commonsense data...")

    commonsense_dir = RAW_DIR / "ethics" / "commonsense"

    train_path = commonsense_dir / "cm_train.csv"
    test_path = commonsense_dir / "cm_test.csv"

    for file in [train_path, test_path]:
        df = pd.read_csv(file)
        df = df[df["is_short"]]
        df = df[["label", "input"]]

        # Invert labels as 0 corresponds to acceptable and 1 to unacceptable in dataset
        df["label"] = ~df["label"].astype(bool)

        out_path = PROCESSED_DIR / (file.stem + ".parquet")
        df.to_parquet(out_path, index=False)

        print(f"Processed {file.name} -> {out_path}")


def preprocess_justice() -> None:
    "Preprocess justice data from ETHICS dataset."
    print("Preprocessing justice data...")

    justice_dir = RAW_DIR / "ethics" / "justice"

    train_path = justice_dir / "justice_train.csv"
    test_path = justice_dir / "justice_test.csv"

    for file in [train_path, test_path]:
        df = pd.read_csv(file)
        df.rename(columns={"scenario": "input"}, inplace=True)
        df["label"] = df["label"].astype(bool)

        out_path = PROCESSED_DIR / (file.stem + ".parquet")
        df.to_parquet(out_path, index=False)

        print(f"Processed {file.name} -> {out_path}")
