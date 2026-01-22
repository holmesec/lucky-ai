import os
import wandb
from transformers import BertTokenizerFast

MODEL_DIR = "/app/model"
TOKENIZER_DIR = "/app/tokenizer"

wandb_api = wandb.Api(
    api_key=os.getenv("WANDB_API_KEY"),
    overrides={
        "entity": os.getenv("WANDB_ENTITY"),
        "project": os.getenv("WANDB_PROJECT"),
    },
)

artifact = wandb_api.artifact("lucky_ai/lucky-ai/lucky_bert:latest")
artifact.download(root=MODEL_DIR)

tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased", cache_dir=TOKENIZER_DIR)

tokenizer.save_pretrained(TOKENIZER_DIR)
