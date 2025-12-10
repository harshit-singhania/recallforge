import os
import json
import google.generativeai as genai
from typing import List, Dict
from django.conf import settings

class LLMService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Fallback to a mock or raise error. 
            # For this step, we want real AI, but to prevent crash on missing key during dev:
            print("WARNING: GEMINI_API_KEY not found in env. Service will fail if called.")
            self.model = None
            return

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate_cards(self, text: str) -> List[Dict[str, str]]:
        """
        Generates flashcards from the given text using Gemini.
        Returns a list of dicts: [{'front': '...', 'back': '...'}]
        """
        if not self.model:
            raise ValueError("Gemini API Key is missing. Please set GEMINI_API_KEY in .env")

        prompt = f"""
        You are a flashcard generation expert.
        Analyze the following text and create a set of high-quality flashcards.
        
        Rules:
        1. Extract the most important concepts, facts, and definitions.
        2. Create Question/Answer pairs.
        3. 'front' should be the question, 'back' should be the answer.
        4. Keep answers concise but comprehensive.
        5. If a concept (like Structure, Anatomy, Hierarchy) is best explained visually, generate a MINIMALIST SVG code snippet illustrating it in 'visual_payload'.
        6. The SVG should be simple, clean, and fit in a small card. Use 100x100 or 200x200 viewbox.
        7. CRITICAL: If the card asks about a specific PART (e.g. "Vertices", "Nucleus", "Right Angle"), generate an SVG that HIGHLIGHTS that part (e.g. in red) while keeping the rest neutral.
        8. If no visual is needed, set 'visual_payload' to null.
        9. Return ONLY a valid JSON array of objects.
        
        Text to analyze:
        {text[:10000]} # Limit context window just in case
        
        Output Format:
        [
            {{"front": "Question 1", "back": "Answer 1", "visual_payload": "<svg>...</svg>"}},
            ...
        ]
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Remove markdown code blocks if present (though mime_type json should avoid it, safety first)
            content = response.text
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            cards = json.loads(content)
            return cards
            
        except Exception as e:
            print(f"Error generating cards with Gemini: {e}")
            raise e

    def generate_cards_from_file(self, file_path: str) -> List[Dict[str, str]]:
        """
        Generates flashcards from a file (Image/PDF) using Gemini.
        """
        if not self.model:
            raise ValueError("Gemini API Key is missing.")

        print(f"Uploading file to Gemini: {file_path}")
        try:
            # 1. Upload file to Gemini File API
            sample_file = genai.upload_file(path=file_path, display_name="RecallForge Source")
            print(f"File uploaded: {sample_file.uri}")

            # 2. Construct Prompt
            # 2. Construct Prompt
            prompt = """
            Analyze this file (visual or document).
            Extract the key concepts, facts, and definitions.
            Create a set of high-quality flashcards (Question/Answer pairs).
            Ignore purely decorative elements. Focus on educational content.
            
            Special Instruction:
            If a card explains a structural concept (e.g. location of an organ, shape of a molecule), try to Generate a simple SVG code snippet illustrating it in 'visual_payload'.
            If the input image ITSELF is a diagram, try to replicate a simplified SVG version of it as the answer visual.
            If no visual is needed, set 'visual_payload' to null.
            
            Return ONLY a valid JSON array of objects: [{"front": "Question", "back": "Answer", "visual_payload": "..."}]
            """

            # 3. Generate Content
            response = self.model.generate_content(
                [sample_file, prompt],
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            # 4. Clean up file? (Optional but good practice if not needed anymore on Gemini side)
            # genai.delete_file(sample_file.name)

            content = response.text
            # Basic cleanup if markdown fences exist
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            return json.loads(content)
            
        except Exception as e:
            print(f"Error generating cards from image: {e}")
            raise e

    def summarize_content(self, text: str) -> str:
        """
        Generates a concise summary of the text.
        """
        if not self.model:
            return "AI Service Unavailable."
            
        prompt = f"""
        Summarize the following text in 3-5 bullet points.
        Capture the main ideas and conclusions.
        
        Text:
        {text[:20000]}
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error summarizing text: {e}"
