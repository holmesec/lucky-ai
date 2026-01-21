from typing import Any, Optional
import hydra
from dotenv import load_dotenv
import pytorch_lightning as pl
from omegaconf import DictConfig, OmegaConf
from pytorch_lightning.loggers import WandbLogger
from lucky_ai.model import LuckyBertModel
from lucky_ai.dataset import LuckyDataModule
from pathlib import Path
import tempfile
import wandb

load_dotenv()


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
    dm = LuckyDataModule(
        model_name=model_cfg["model_name"],
        batch_size=data_cfg["batch_size"],
        num_workers=data_cfg["num_workers"],
        data_dir=data_cfg["path"],
    )

    # Initialize the Model
    model = LuckyBertModel(model_name=model_cfg["model_name"], lr=model_cfg["lr"])

    train_cfg: Any = cfg["training"]
    logger: Optional[WandbLogger] = None

    if train_cfg["logger"]["enabled"]:
        logger = WandbLogger(
            project=train_cfg["logger"]["project"], entity="lucky_ai", log_model=train_cfg["logger"]["log_model"]
        )
        # Optional: Watch the model to see gradients in WandB
        logger.watch(model, log="all")

    # Initialize the Trainer
    trainer = pl.Trainer(
        max_epochs=train_cfg["max_epochs"],
        accelerator=train_cfg["accelerator"],
        devices=train_cfg["devices"],
        precision=train_cfg["precision"],
        log_every_n_steps=train_cfg["log_every_n_steps"],
        logger=logger,
        default_root_dir="models/",
    )

    # Start training
    trainer.fit(model, datamodule=dm)

    # Save + log final model
    if logger is not None:
        with tempfile.TemporaryDirectory() as tmpdir:
            ckpt_path = Path(tmpdir) / "model.ckpt"

            trainer.save_checkpoint(ckpt_path)

            artifact = wandb.Artifact(
                name="lucky_bert",
                type="model",
                description="Final fine-tuned BERT model",
            )

            artifact.add_file(str(ckpt_path))

            logger.experiment.log_artifact(
                artifact,
                aliases=["latest"],
            )


if __name__ == "__main__":
    train()
