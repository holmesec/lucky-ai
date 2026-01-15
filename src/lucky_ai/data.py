from pathlib import Path

import typer
from torch.utils.data import Dataset
import pandas as pd
import torch


RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")

class LuckyDataset(Dataset):
    """Dataset with questions and dilemmas."""

    def __init__(self, data_path: Path) -> None:
        super().__init__()
        self.data_path = data_path

    def __len__(self) -> int:
        """Return the length of the dataset."""

    def __getitem__(self, index: int):
        """Return a given sample from the dataset."""

    def load_data(self) -> None:
        """Load data from the data path."""

    

def preprocess(subset: str = "all") -> None:
    print("Preprocessing data...")

    if subset == "all" or subset == "commonsense":
        preprocess_commonsense()
    if  subset == "all" or subset == "justice":
        preprocess_justice()



def preprocess_commonsense() -> None:
    "Preprocess commonsense data from ETHICS dataset."
    print("Preprocessing commonsense data...")

    commonsense_dir = RAW_DIR / "ethics" / "commonsense"

    train_path = commonsense_dir / "cm_train.csv"
    test_path = commonsense_dir / "cm_test.csv"

    for file in [train_path, test_path]:
        df = pd.read_csv(file)
        df = df[df["is_short"] == True]
        df = df[["label", "input"]]

        # Invert labels as 0 corresponds to acceptable and 1 to unacceptable in  dataset
        df['label'] = ~df['label'].astype(bool)

        out_path = PROCESSED_DIR / file.name
        df.to_csv(out_path, index=False)

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
        df['label'] = df['label'].astype(bool)

        out_path = PROCESSED_DIR / file.name
        df.to_csv(out_path, index=False)

        print(f"Processed {file.name} -> {out_path}")

if __name__ == "__main__":
    #typer.run(preprocess)

    preprocess_strategyQA()
