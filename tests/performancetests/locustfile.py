from locust import HttpUser, between, task


class BotUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def get_docs(self) -> None:
        """A task that simulates a user visiting docs of the FastAPI app."""
        self.client.get("/docs")

    @task(2)
    def ask_model(self) -> None:
        """A task that simulates a user running inference on the ML model."""
        self.client.post("/ask_model/?question=Is+AI+cool%3F")
