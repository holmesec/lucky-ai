from pathlib import Path
import pandas as pd
from datasets import load_dataset
import typer

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")

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

    train_path = commonsense_dir / "commonsense_train.csv"
    test_path = commonsense_dir / "commonsense_test.csv"

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
