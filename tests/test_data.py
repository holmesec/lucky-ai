from torch.utils.data import Dataset

from lucky_ai.data import LuckyDataset


def test_dataset():
    """Test the LuckyDataset class."""
    for mode in [True, False]:  # True for train, False for test
        dataset = LuckyDataset(mode)
        assert isinstance(dataset, Dataset)
        assert len(dataset) > 0
        question, target = dataset[0]
        assert isinstance(question, str)
        assert isinstance(target, bool)


if __name__ == "__main__":
    test_dataset()
