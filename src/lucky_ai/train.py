from typing import Any
import hydra
import pytorch_lightning as pl
from omegaconf import DictConfig, OmegaConf
from lucky_ai.model import LuckyBertModel
from lucky_ai.data import LuckyDataModule


@hydra.main(config_path="../../configs", config_name="config.yaml", version_base="1.1")
def train(cfg: DictConfig) -> None:
    """
    Main training entry point.
    Uses Hydra for configuration and Lightning for training execution.
    """
    # Reproducibility settings
    pl.seed_everything(cfg["seed"])

    # Log the full configuration for traceability
    print(f"Configuration:\n{OmegaConf.to_yaml(cfg)}")

    # Initialize the DataModule
    data_cfg: Any = cfg["data"]
    model_cfg: Any = cfg["model"]
    dm = LuckyDataModule(model_name=model_cfg["model_name"], batch_size=data_cfg["batch_size"])

    # Initialize the Model
    model = LuckyBertModel(model_name=model_cfg["model_name"], lr=model_cfg["lr"])

    # Initialize the Trainer
    train_cfg: Any = cfg["training"]
    # trainer = pl.Trainer(
    #     max_epochs=train_cfg["max_epochs"],
    #     accelerator=train_cfg["accelerator"],
    #     devices=train_cfg["devices"],
    #     precision=train_cfg["precision"],
    #     log_every_n_steps=train_cfg["log_every_n_steps"],
    #     default_root_dir="models/"
    # )

    trainer = pl.Trainer(
        max_epochs=train_cfg["max_epochs"],
        accelerator=train_cfg["accelerator"],
        devices=train_cfg["devices"],
        precision=train_cfg["precision"],
        limit_train_batches=0.001,
        limit_val_batches=0.005,
        log_every_n_steps=1,
        default_root_dir="models/",
    )

    # Execute fine-tuning
    print("Starting training process")
    trainer.fit(model, datamodule=dm)


if __name__ == "__main__":
    train()
