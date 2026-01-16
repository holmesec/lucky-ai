from typing import Any

import pytorch_lightning as pl
import torch
from torch import nn
from transformers import BertModel


class LuckyBertModel(pl.LightningModule):
    """
    LightningModule for BERT-based binary classification.

    Attributes:
        bert: The pre-trained BERT model.
        classifier: Linear layer for binary classification.
        criterion: Loss function (CrossEntropy).
    """

    def __init__(self, model_name: str = "bert-base-uncased", lr: float = 1e-5) -> None:
        super().__init__()
        # Save hyperparameters to self.hparams for reproducibility

        self.save_hyperparameters()
        self.bert = BertModel.from_pretrained(self.hparams["model_name"])
        self.bert.train()
        self.classifier = nn.Linear(self.bert.config.hidden_size, 2)
        self.criterion = nn.CrossEntropyLoss()

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """Standard forward pass for inference."""
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        # Use the pooled representation of [CLS] token
        return self.classifier(outputs.pooler_output)

    def training_step(self, batch: dict[str, torch.Tensor], batch_idx: int) -> torch.Tensor:
        """Individual training step."""

        input_ids, attention_mask, labels = batch["input_ids"], batch["attention_mask"], batch["labels"]

        logits = self(input_ids, attention_mask)
        loss = self.criterion(logits, labels)

        # Session 4: Log metrics for visualization (e.g. in wandb later)
        self.log("train/loss", loss, on_step=True, on_epoch=True, prog_bar=True)
        return loss

    def validation_step(self, batch: dict[str, torch.Tensor], batch_idx: int) -> torch.Tensor:
        """Individual validation step."""
        input_ids, attention_mask, labels = batch["input_ids"], batch["attention_mask"], batch["labels"]

        logits = self(input_ids, attention_mask)
        loss = self.criterion(logits, labels)

        preds = torch.argmax(logits, dim=1)
        acc = (preds == labels).float().mean()

        # sync_dist=True for multi-GPU scaling
        self.log("val/loss", loss, on_epoch=True, prog_bar=True, sync_dist=True)
        self.log("val/acc", acc, on_epoch=True, prog_bar=True, sync_dist=True)
        return loss

    def configure_optimizers(self) -> Any:
        """Setup the Adam optimizer."""
        return torch.optim.Adam(self.parameters(), lr=self.hparams["lr"])


if __name__ == "__main__":
    # Test the Lightning implementation
    model = LuckyBertModel()

    print(f"Model initialized: {model.hparams['model_name']}")
