from pathlib import Path

import typer
from torch.utils.data import Dataset
import pandas as pd
import os
from datasets import load_dataset

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")


class LuckyDataset(Dataset):
    """Dataset with questions and boolean dilemmas."""

    def __init__(self, train: bool = True) -> None:
        super().__init__()
        self.mode = "train" if train else "test"
        self.load_data()

    def load_data(self) -> None:
        """Load questions (strings) and targets (bool) from disk."""
        self.questions, self.target = [], []
        for f in os.listdir(PROCESSED_DIR):
            if self.mode not in f:
                continue
            df = pd.read_parquet(PROCESSED_DIR / f)
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
    ds = load_dataset("ChilleD/StrategyQA")
    # Extract train and test splits
    for split in ["train", "test"]:
        df = ds[split].to_pandas()
        # Keep only 'question' and 'label' columns
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
