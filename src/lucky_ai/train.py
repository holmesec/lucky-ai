from typing import Any

import hydra
import pytorch_lightning as pl
from omegaconf import DictConfig, OmegaConf

from lucky_ai.model import LuckyBertModel


@hydra.main(config_path="../../configs", config_name="config.yaml", version_base="1.1")
def train(cfg: DictConfig) -> None:
    """
    Main training loop.

    Args:
        cfg: The Hydra configuration object.
    """
    # Reproducibility: Set seeds
    pl.seed_everything(cfg["seed"])

    # Print config for debugging
    print(f"Configuration:\n{OmegaConf.to_yaml(cfg)}")

    # Initialize Model
    # We cast to Any to avoid "MutableMapping" attribute errors
    model_cfg: Any = cfg["model"]
    model = LuckyBertModel(model_name=model_cfg["model_name"], lr=model_cfg["lr"])

    # Initialize Trainer
    train_cfg: Any = cfg["training"]

    trainer = pl.Trainer(
        max_epochs=train_cfg["max_epochs"],
        accelerator=train_cfg["accelerator"],
        devices=train_cfg["devices"],
        precision=train_cfg["precision"],
        log_every_n_steps=train_cfg["log_every_n_steps"],
        default_root_dir="models/",
    )

    # 5. Fit Model
    print(f"Trainer configured with {train_cfg['max_epochs']} epochs.")
    print("Training script initialized. Ready for DataModule integration.")

    # trainer.fit(model, datamodule=dm)


if __name__ == "__main__":
    train()
