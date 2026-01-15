import torch
from torch import nn
import pytorch_lightning as pl
from transformers import BertModel


class LuckyBertModel(pl.LightningModule):
    """
    LightningModule for BERT-based binary classification.

    This class handles the model architecture, the training/validation steps,
    and the optimizer configuration.
    """

    def __init__(self, model_name: str = "bert-base-uncased", lr: float = 1e-5) -> None:
        super().__init__()
        self.save_hyperparameters()  # This saves model_name and lr for reproducibility

        self.bert = BertModel.from_pretrained(model_name)
        self.classifier = nn.Linear(self.bert.config.hidden_size, 2)
        self.criterion = nn.CrossEntropyLoss()

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """Standard forward pass."""
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        return self.classifier(pooled_output)

    def training_step(self, batch: dict[str, torch.Tensor], batch_idx: int) -> torch.Tensor:
        """
        Logic for a single training step.

        Note: The batch is expected to be a dict provided by the Data Person's DataLoader.
        """
        input_ids = batch["input_ids"]
        attention_mask = batch["attention_mask"]
        labels = batch["labels"]

        logits = self(input_ids, attention_mask)
        loss = self.criterion(logits, labels)

        # Log training loss (Lightning handles the 'how' and 'where')
        self.log("train_loss", loss)
        return loss

    def validation_step(self, batch: dict[str, torch.Tensor], batch_idx: int) -> None:
        """Logic for a single validation step."""
        input_ids = batch["input_ids"]
        attention_mask = batch["attention_mask"]
        labels = batch["labels"]

        logits = self(input_ids, attention_mask)
        loss = self.criterion(logits, labels)

        # Calculate accuracy
        preds = torch.argmax(logits, dim=1)
        acc = (preds == labels).float().mean()

        self.log("val_loss", loss, prog_bar=True, sync_dist=True)
        self.log("val_acc", acc, prog_bar=True, sync_dist=True)

    def configure_optimizers(self):
        """Define the optimizer (course standard uses Adam)."""
        return torch.optim.Adam(self.parameters(), lr=self.hparams.lr)


if __name__ == "__main__":
    # Test the Lightning implementation
    model = LuckyBertModel()
    print(model)

    # Simulate a batch from the Data Person
    fake_batch = {
        "input_ids": torch.randint(0, 100, (2, 10)),
        "attention_mask": torch.ones((2, 10)),
        "labels": torch.tensor([0, 1]),
    }

    loss = model.training_step(fake_batch, 0)
    print(f"Initial test loss: {loss.item()}")
