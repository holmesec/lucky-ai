import torch
from torch.utils.data import Dataset

from lucky_ai.dataset import LuckyDataset, LuckyDataModule


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
