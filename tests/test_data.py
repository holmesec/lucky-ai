import pandas as pd
from unittest.mock import patch

from lucky_ai.data import (
    preprocess_commonsense,
    preprocess_justice,
    preprocess_strategyQA,
    preprocess_boolq,
)


def test_preprocess_commonsense(tmp_path):
    """Test commonsense preprocessing on actual raw data."""
    output_dir = tmp_path / "processed"
    output_dir.mkdir()

    with patch("lucky_ai.data.PROCESSED_DIR", output_dir):
        preprocess_commonsense()

    # Check train file
    train_df = pd.read_parquet(output_dir / "commonsense_train.parquet")
    assert "label" in train_df.columns
    assert "input" in train_df.columns
    assert train_df["label"].dtype == bool
    assert len(train_df) > 0

    # Check test file
    test_df = pd.read_parquet(output_dir / "commonsense_test.parquet")
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
