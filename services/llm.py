import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
from django.conf import settings

# Sophisticated prompt templates for high-quality flashcard generation
FLASHCARD_SYSTEM_PROMPT = """You are an expert educational content designer specializing in spaced repetition learning. 
You create flashcards that optimize long-term retention for high school and college students.

## Your Expertise:
- Bloom's Taxonomy (creating cards at different cognitive levels)
- Active recall techniques
- Minimizing interference between similar concepts
- Creating memorable, unambiguous cards

## Card Quality Principles:
1. ONE concept per card (atomic knowledge)
2. Questions should test UNDERSTANDING, not just recognition
3. Answers should be COMPLETE but CONCISE (ideally 1-3 sentences)
4. Include CONTEXT when the concept could be confused with similar ones
5. Use CLOZE-style when testing terminology: "The process of _____ converts light energy to chemical energy"
6. For processes/sequences, test individual STEPS, not the whole sequence at once

## AVOID These Anti-Patterns:
❌ Yes/No questions (e.g., "Is mitochondria the powerhouse?")
❌ Verbatim text copying (paraphrase and rephrase)
❌ Overly broad questions ("Explain photosynthesis")
❌ Questions with obvious answers from the question itself
❌ Multiple correct answers possible without context"""


FLASHCARD_GENERATION_PROMPT = """Analyze this educational content and generate high-quality flashcards.

## Content to Analyze:
{content}

## Instructions:
Create {num_cards} flashcards following these guidelines:

### Card Types to Include (mix these):
1. **Definition Cards**: "What is [term]?" → Clear, complete definition
2. **Concept Cards**: "Why does [phenomenon] occur?" → Explanation of mechanism
3. **Application Cards**: "How would you [apply concept] to [scenario]?" → Real-world application  
4. **Comparison Cards**: "What distinguishes [X] from [Y]?" → Key differences
5. **Process Cards**: "What is the [first/next] step in [process]?" → Sequential knowledge
6. **Cloze Cards**: Statement with "___" for the key term → Tests terminology

### Difficulty Mix:
- 40% Basic recall (definitions, facts)
- 40% Understanding (explanations, relationships)
- 20% Application (scenarios, examples)

### For Each Card:
- "front": The question or prompt (clear, specific, unambiguous)
- "back": The answer (complete but concise, 1-3 sentences ideal)
- "hint": Optional hint to help recall without giving away answer
- "difficulty": "basic" | "intermediate" | "advanced"
- "tags": Array of topic tags for organization
- "visual_payload": If concept benefits from a diagram, provide minimal SVG (100x100 viewbox). Otherwise null.

### Output Format (JSON array):
[
  {{
    "front": "What cellular organelle is responsible for ATP production through cellular respiration?",
    "back": "The mitochondria. It uses oxygen to break down glucose and produces ATP, the cell's primary energy currency.",
    "hint": "Often called the 'powerhouse' of the cell",
    "difficulty": "basic",
    "tags": ["biology", "cell-biology", "organelles"],
    "visual_payload": null
  }}
]

Generate high-quality, educational flashcards now:"""


class LLMService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in env. Service will fail if called.")
            self.model = None
            return

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash',
            system_instruction=FLASHCARD_SYSTEM_PROMPT
        )

    def generate_cards(self, text: str, num_cards: Optional[int] = None) -> List[Dict[str, str]]:
        """
        Generates high-quality flashcards from text using Gemini.
        Returns a list of dicts with front, back, hint, difficulty, tags.
        """
        if not self.model:
            raise ValueError("Gemini API Key is missing. Please set GEMINI_API_KEY in .env")

        # Estimate appropriate number of cards based on content length
        if num_cards is None:
            word_count = len(text.split())
            # Roughly 1 card per 50-100 words of content
            num_cards = max(3, min(20, word_count // 75))

        prompt = FLASHCARD_GENERATION_PROMPT.format(
            content=text[:15000],  # Increased context window
            num_cards=num_cards
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.7,  # Some creativity but not too random
                )
            )
            
            content = response.text
            # Clean up potential markdown fences
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            cards = json.loads(content)
            
            # Validate and normalize card structure
            validated_cards = []
            for card in cards:
                validated_card = {
                    "front": card.get("front", ""),
                    "back": card.get("back", ""),
                    "hint": card.get("hint"),
                    "difficulty": card.get("difficulty", "basic"),
                    "tags": card.get("tags", []),
                    "visual_payload": card.get("visual_payload")
                }
                if validated_card["front"] and validated_card["back"]:
                    validated_cards.append(validated_card)
                    
            return validated_cards
            
        except Exception as e:
            print(f"Error generating cards with Gemini: {e}")
            raise e

    def generate_cards_from_file(self, file_path: str) -> List[Dict[str, str]]:
        """
        Generates flashcards from a file (Image/PDF) using Gemini Vision.
        """
        if not self.model:
            raise ValueError("Gemini API Key is missing.")

        print(f"Uploading file to Gemini: {file_path}")
        try:
            # Upload file to Gemini File API
            sample_file = genai.upload_file(path=file_path, display_name="RecallForge Source")
            print(f"File uploaded: {sample_file.uri}")

            prompt = """Analyze this educational material (image, diagram, or document).
            
Extract ALL key concepts, facts, definitions, and relationships visible.
Create high-quality flashcards following these principles:

1. ONE concept per card
2. Test UNDERSTANDING, not just recognition
3. If this is a DIAGRAM, create cards that:
   - Test identification of labeled parts
   - Test relationships between components
   - Test the function/purpose of each element

4. Include a variety of question types:
   - "What is [X]?" for definitions
   - "What is the function of [X]?" for purposes
   - "How does [X] relate to [Y]?" for relationships
   - "What would happen if [X]?" for understanding

For each card, provide:
- "front": Clear, specific question
- "back": Complete, concise answer (1-3 sentences)
- "hint": Optional memory aid (without giving away the answer)
- "difficulty": "basic" | "intermediate" | "advanced"
- "tags": Topic tags
- "visual_payload": If relevant, a minimal SVG diagram (100x100 viewbox) highlighting the concept. Otherwise null.

Return ONLY a valid JSON array."""

            response = self.model.generate_content(
                [sample_file, prompt],
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )

            content = response.text
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            return json.loads(content)
            
        except Exception as e:
            print(f"Error generating cards from file: {e}")
            raise e

    def summarize_content(self, text: str) -> str:
        """
        Generates a concise summary of the text.
        """
        if not self.model:
            return "AI Service Unavailable."
            
        prompt = f"""Summarize this educational content for a student.

Provide:
1. **Main Topic**: One-line description
2. **Key Concepts** (3-5 bullet points): The most important ideas
3. **Study Focus**: What a student should prioritize learning

Content:
{text[:20000]}
"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error summarizing text: {e}"

    def get_embedding(self, text: str) -> list:
        """
        Generate embedding vector for text using Gemini's embedding model.
        Returns a 768-dimensional vector.
        """
        if not self.model:
            raise ValueError("Gemini API Key is missing.")
        
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text[:8000],
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [0.0] * 768

    def improve_card(self, front: str, back: str) -> Dict[str, str]:
        """
        Takes an existing card and improves its quality.
        Useful for user-created cards.
        """
        if not self.model:
            return {"front": front, "back": back}
            
        prompt = f"""Improve this flashcard for better learning:

Original Question: {front}
Original Answer: {back}

Improve by:
1. Making the question more specific and unambiguous
2. Ensuring the answer is complete but concise
3. Adding a helpful hint
4. Suggesting difficulty level and tags

Return JSON:
{{"front": "improved question", "back": "improved answer", "hint": "memory aid", "difficulty": "basic|intermediate|advanced", "tags": ["tag1", "tag2"]}}
"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except:
            return {"front": front, "back": back}
