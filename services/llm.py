from typing import List, Dict

class LLMService:
    def generate_cards(self, text: str) -> List[Dict[str, str]]:
        """
        Mock implementation of card generation.
        In a real scenario, this would call OpenAI/Gemini.
        """
        # Mock logic: return a dummy card based on the text length
        summary = text[:50] + "..." if len(text) > 50 else text
        return [
            {
                "front": f"What is the main topic of: {summary}?",
                "back": "This is a machine generated answer based on the text context."
            },
            {
                "front": "Key concept extracted from text?",
                "back": "The key concept is likely related to the first paragraph."
            }
        ]
