# tests/test_model.py
import torch
from lucky_ai.model import LuckyBertModel


def test_model_initialization():
    """Check if the model loads hyperparameters correctly."""
    model = LuckyBertModel(model_name="bert-base-uncased", lr=1e-4)
    assert model.hparams.lr == 1e-4
    assert model.hparams.model_name == "bert-base-uncased"


def test_model_forward():
    """Check if the forward pass returns correct shapes."""
    model = LuckyBertModel()
    # Batch of 3, sequence length of 12
    input_ids = torch.randint(0, 100, (3, 12))
    attention_mask = torch.ones((3, 12))

    output = model(input_ids, attention_mask)
    assert output.shape == (3, 2)  # 3 samples, 2 classes (Yes/No)


def test_model_training_step():
    """Check if the training step returns a scalar loss."""
    model = LuckyBertModel()
    batch = {
        "input_ids": torch.randint(0, 100, (2, 10)),
        "attention_mask": torch.ones((2, 10)),
        "labels": torch.tensor([0, 1]),
    }
    loss = model.training_step(batch, 0)
    assert loss.ndim == 0  # Should be a single number
    assert not torch.isnan(loss)
