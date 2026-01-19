import torch
import pandas as pd
from unittest.mock import patch
from torch.utils.data import Dataset

from lucky_ai.data import LuckyDataset, LuckyDataModule
from lucky_ai.data import (
    preprocess_commonsense,
    preprocess_justice,
    preprocess_strategyQA,
    preprocess_boolq,
)


def test_dataset():
    """Test the LuckyDataset class."""
    for mode in [True, False]:  # True for train, False for test
        dataset = LuckyDataset(mode)
        assert isinstance(dataset, Dataset)
        assert len(dataset) > 0
        question, target = dataset[0]
        assert isinstance(question, str)
        assert isinstance(target, bool)


def test_datamodule_setup():
    """Verify that the datamodule initializes and loads datasets correctly."""
    # We use a small batch size for testing
    dm = LuckyDataModule(model_name="bert-base-uncased", batch_size=4)
    dm.setup()

    assert dm.train_set is not None
    assert dm.test_set is not None


def test_collate_fn():
    """Verify that the collate_fn produces the correct tensor shapes for BERT."""
    dm = LuckyDataModule(model_name="bert-base-uncased", batch_size=2)

    # Simulate raw data from the Dataset
    mock_batch = [("Is the sky blue?", True), ("Is grass purple?", False)]

    output = dm.collate_fn(mock_batch)

    # Check keys expected by LuckyBertModel
    assert "input_ids" in output
    assert "attention_mask" in output
    assert "labels" in output

    # Check shapes (Batch size 2, labels should be Long)
    assert output["input_ids"].shape[0] == 2
    assert output["labels"].dtype == torch.int64


def test_dataloaders():
    """Check if dataloaders return valid batches."""
    dm = LuckyDataModule(batch_size=2)
    dm.setup()

    train_loader = dm.train_dataloader()
    batch = next(iter(train_loader))

    assert batch["input_ids"].ndim == 2
    assert batch["input_ids"].shape[0] == 2


def test_preprocess_commonsense(tmp_path):
    """Test commonsense preprocessing on actual raw data."""
    output_dir = tmp_path / "processed"
    output_dir.mkdir()

    with patch("lucky_ai.data.PROCESSED_DIR", output_dir):
        preprocess_commonsense()

    # Check train file
    train_df = pd.read_parquet(output_dir / "cm_train.parquet")
    assert "label" in train_df.columns
    assert "input" in train_df.columns
    assert train_df["label"].dtype == bool
    assert len(train_df) > 0

    # Check test file
    test_df = pd.read_parquet(output_dir / "cm_test.parquet")
    assert "label" in test_df.columns
    assert "input" in test_df.columns
    assert test_df["label"].dtype == bool
    assert len(test_df) > 0


def test_preprocess_justice(tmp_path):
    """Test justice preprocessing on actual raw data."""
    output_dir = tmp_path / "processed"
    output_dir.mkdir()

    with patch("lucky_ai.data.PROCESSED_DIR", output_dir):
        preprocess_justice()

    # Check train file
    train_df = pd.read_parquet(output_dir / "justice_train.parquet")
    assert "input" in train_df.columns
    assert "label" in train_df.columns
    assert train_df["label"].dtype == bool
    assert len(train_df) > 0

    # Check test file
    test_df = pd.read_parquet(output_dir / "justice_test.parquet")
    assert "input" in test_df.columns
    assert "label" in test_df.columns
    assert test_df["label"].dtype == bool
    assert len(test_df) > 0


def test_preprocess_strategyqa(tmp_path):
    """Test StrategyQA preprocessing on actual dataset."""
    output_dir = tmp_path / "processed"
    output_dir.mkdir()

    with patch("lucky_ai.data.PROCESSED_DIR", output_dir):
        preprocess_strategyQA()

    # Check train file
    train_df = pd.read_parquet(output_dir / "strategyqa_train.parquet")
    assert list(train_df.columns) == ["input", "label"]
    assert train_df["label"].dtype == bool
    assert len(train_df) > 0

    # Check test file
    test_df = pd.read_parquet(output_dir / "strategyqa_test.parquet")
    assert list(test_df.columns) == ["input", "label"]
    assert test_df["label"].dtype == bool
    assert len(test_df) > 0


def test_preprocess_boolq(tmp_path):
    """Test BoolQ preprocessing on actual dataset."""
    output_dir = tmp_path / "processed"
    output_dir.mkdir()

    with patch("lucky_ai.data.PROCESSED_DIR", output_dir):
        preprocess_boolq()

    # Check train file
    train_df = pd.read_parquet(output_dir / "boolq_train.parquet")
    assert list(train_df.columns) == ["input", "label"]
    assert train_df["label"].dtype == bool
    assert len(train_df) > 0

    # Check test file
    test_df = pd.read_parquet(output_dir / "boolq_test.parquet")
    assert list(test_df.columns) == ["input", "label"]
    assert test_df["label"].dtype == bool
    assert len(test_df) > 0


if __name__ == "__main__":
    test_dataset()
