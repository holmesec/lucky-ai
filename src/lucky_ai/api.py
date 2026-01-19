import os
from contextlib import asynccontextmanager

import torch
import wandb
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from torch.nn import Softmax
from transformers import BertTokenizerFast

from lucky_ai.model import LuckyBertModel

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer, tokenize, softmax
    wandb_api = wandb.Api(
        api_key=os.getenv("WANDB_API_KEY"),
        overrides={"entity": os.getenv("WANDB_ENTITY"), "project": os.getenv("WANDB_PROJECT")},
    )
    artifact_name = "lucky_ai/lucky-ai/lucky_bert:latest"
    artifact = wandb_api.artifact(name=artifact_name)
    path = artifact.download()
    model = LuckyBertModel.load_from_checkpoint(f"{path}/model.ckpt")
    model.eval()

    tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")

    softmax = Softmax(dim=1)

    def tokenize(question: str, tokenizer: BertTokenizerFast = tokenizer) -> tuple[torch.Tensor, torch.Tensor]:
        encoding = tokenizer(question, return_tensors="pt", padding=True, truncation=True, max_length=128)
        input_ids = encoding["input_ids"]
        attention_mask = encoding["attention_mask"]
        return input_ids, attention_mask

    yield

    del model, tokenizer, softmax


app = FastAPI(lifespan=lifespan)


@app.get("/", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url="/docs")


@app.post("/ask_model/")
def read_item(question: str):
    input_ids, attention_mask = tokenize(question)
    out = model(input_ids=input_ids, attention_mask=attention_mask)
    probs = softmax(out).detach().numpy()[0]
    return {"probs": {"yes": float(probs[1]), "no": float(probs[0])}}
