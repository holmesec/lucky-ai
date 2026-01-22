from contextlib import asynccontextmanager

import torch
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
    model = LuckyBertModel.load_from_checkpoint("/app/model/model.ckpt")
    model.eval()

    tokenizer = BertTokenizerFast.from_pretrained("/app/tokenizer")

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
