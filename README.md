# lucky_ai

### Overall goal of the project

The goal of the lucky_ai project is to build a language model that can provide clear and simple binary answers, specifically "yes" or "no", to a wide range of user questions. The model is designed to take a natural language prompt describing a question, situation, or dilemma and return a binary decision along with an associated confidence level.

The project targets both factual yes/no questions (e.g., general knowledge or common-sense reasoning) and subjective or moral dilemmas (e.g. ethical decision-making or personal judgments). Rather than presenting the model's output as a definitive truth, the probabilities associated with each answer are visualized as a lucky wheel. Each segment of the wheel represents "yes" or "no", weighted according to the model's predicted confidence. Users can then spin the wheel to arrive at a decision, embracing an element of randomness while still grounding the outcome in model-based reasoning. This makes the system particularly appealing for decision-making, factual questions, or resolving ambiguous scenarios.

### Model choice

Because the task is framed as text-to-classification with a fixed set of outputs, an encoder-only architecture is well suited for this project. A [pre-trained BERT model](https://huggingface.co/google-bert/bert-base-uncased) is chosen for the task and will be used using the [Hugging Face Transformers framework](https://huggingface.co/docs/transformers/index). The model will be fine-tuned for the specific task of generating "yes"/"no" answers.

### Data sources

The model will be fine-tuned on the following datasets:

- **BoolQ:**: A large-scale yes/no question-answering dataset developed by Google, focused on factual and reading-comprehension-based questions. [Link to Hugging face](https://huggingface.co/datasets/google/boolq)
- **StrategyQA:** A dataset containing yes/no questions that require multi-step and implicit reasoning, helping the model handle more complex scenarios. [Link](https://github.com/eladsegal/strategyqa)
- **ETHICS:** A dataset designed to evaluate moral reasoning, with labels such as "acceptable" and "not acceptable", which can be mapped to "yes" and "no" answers for ethical dilemmas. [Link](https://github.com/hendrycks/ethics)
- ...

## Project structure

The directory structure of the project looks like this:

```txt
├── .github/                  # Github actions and dependabot
│   ├── dependabot.yaml
│   └── workflows/
│       └── tests.yaml
├── configs/                  # Configuration files
├── data/                     # Data directory
│   ├── processed
│   └── raw
├── dockerfiles/              # Dockerfiles
│   ├── api.Dockerfile
│   └── train.Dockerfile
├── docs/                     # Documentation
│   ├── mkdocs.yml
│   └── source/
│       └── index.md
├── models/                   # Trained models
├── notebooks/                # Jupyter notebooks
├── reports/                  # Reports
│   └── figures/
├── src/                      # Source code
│   ├── project_name/
│   │   ├── __init__.py
│   │   ├── api.py
│   │   ├── data.py
│   │   ├── evaluate.py
│   │   ├── models.py
│   │   ├── train.py
│   │   └── visualize.py
└── tests/                    # Tests
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_data.py
│   └── test_model.py
├── .gitignore
├── .pre-commit-config.yaml
├── LICENSE
├── pyproject.toml            # Python project file
├── README.md                 # Project README
├── requirements.txt          # Project requirements
├── requirements_dev.txt      # Development requirements
└── tasks.py                  # Project tasks
```

Created using [mlops_template](https://github.com/SkafteNicki/mlops_template),
a [cookiecutter template](https://github.com/cookiecutter/cookiecutter) for getting
started with Machine Learning Operations (MLOps).
