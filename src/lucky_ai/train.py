from lucky_ai.model import LuckyBertModel
# from lucky_ai.data import MyDataset # Commented out until Data Person is ready


def train() -> None:
    """Initial training logic."""
    # We initialize your new BERT model
    model = LuckyBertModel()

    # We print it so Ruff knows we are 'using' the variable
    print(f"Model initialized: {model.hparams.model_name}")

    # In the future add:
    # trainer = pl.Trainer(...)
    # trainer.fit(model, ...)


if __name__ == "__main__":
    train()
