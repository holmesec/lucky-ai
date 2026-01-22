import os
from pathlib import Path
import pandas as pd
from datasets import load_dataset
from lucky_ai.database import insert_user_data, fetch_user_data
import typer

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")

preprocess_app = typer.Typer()
add_data_app = typer.Typer()


@add_data_app.command()
def add_user_data(input: str, label: bool):
    """Append a new user data entry to the user data database."""
    insert_user_data(input, label)


@preprocess_app.command()
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
    - user          : User generated dataset
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
    if subset == "all" or subset == "user":
        preprocess_user()

    print("Preprocessing complete.")


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


def preprocess_user() -> None:
    "Preprocess boolean user data."
    print("Preprocessing user data...")

    # Fetch user data from database
    df = fetch_user_data()

    if df.empty:
        print("No user data found in database.")
        return

    # Ensure timestamp column is datetime
    df["time"] = pd.to_datetime(df["time"])

    # Rename columns to match expected format
    df.rename(columns={"prompt": "input"}, inplace=True)

    # Path to sync timestamp file
    sync_file = "last_user_data_sync.txt"

    # Read last sync timestamp
    if os.path.exists(sync_file):
        with open(sync_file, "r") as f:
            last_sync = f.read().strip()
            last_sync_time = pd.to_datetime(last_sync)
    else:
        # If no sync file, treat all data as new data
        last_sync_time = pd.Timestamp.min.tz_localize("UTC")

    # Split data by timestamp
    old_data = df[df["time"] <= last_sync_time]
    new_data = df[df["time"] > last_sync_time]

    # Process old data with 80/20 split if it exists
    if not old_data.empty:
        old_data = old_data.sample(frac=1).reset_index(drop=True)
        split_idx = max(1, int(len(old_data) * 0.8))

        train_df = old_data.iloc[:split_idx][["input", "label"]]
        test_df = old_data.iloc[split_idx:][["input", "label"]]

        train_path = PROCESSED_DIR / "user_train.parquet"
        test_path = PROCESSED_DIR / "user_test.parquet"

        train_df.to_parquet(train_path, index=False)
        test_df.to_parquet(test_path, index=False)
        print(f"Saved {len(train_df)} old samples to {train_path}")
        print(f"Saved {len(test_df)} old samples to {test_path}")

    # Save new data to new_user_train.parquet
    if not new_data.empty:
        new_train_df = new_data[["input", "label"]]
        new_train_path = PROCESSED_DIR / "new_user_train.parquet"
        new_train_df.to_parquet(new_train_path, index=False)
        print(f"Saved {len(new_train_df)} new samples to {new_train_path}")

    # Update last sync timestamp with latest timestamp in df
    latest_timestamp = df["time"].max()
    with open(sync_file, "w") as f:
        f.write(str(latest_timestamp))
    print(f"Updated last sync timestamp to {latest_timestamp}")


if __name__ == "__main__":
    pass
