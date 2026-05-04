import os
from datasets import load_dataset

os.makedirs('data/truthfulqa', exist_ok=True)
ds = load_dataset("truthful_qa", "generation")
ds['validation'].to_json('data/truthfulqa/generation.jsonl')
print("Downloaded TruthfulQA to data/truthfulqa/generation.jsonl")
