#!/usr/bin/env python3
"""
Test script for flashcard generation from PDF using Gemini Vision API.
"""
import os
import sys
import json

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.llm import LLMService


def test_pdf_flashcard_generation(pdf_path: str):
    """
    Test flashcard generation from a PDF file.
    """
    print("=" * 60)
    print("RecallForge - PDF Flashcard Generation Test")
    print("=" * 60)
    
    # Validate file exists
    if not os.path.exists(pdf_path):
        print(f"❌ Error: File not found: {pdf_path}")
        return
    
    print(f"\n📄 PDF Path: {pdf_path}")
    print(f"📦 File Size: {os.path.getsize(pdf_path) / 1024:.1f} KB")
    
    # Initialize LLM Service
    print("\n🔄 Initializing Gemini AI...")
    llm = LLMService()
    
    if not llm.model:
        print("❌ Error: Gemini API key not configured")
        return
    
    print("✅ Gemini AI initialized")
    
    # Generate flashcards
    print("\n🧠 Generating flashcards from PDF...")
    print("   (This may take 30-60 seconds for large documents)\n")
    
    try:
        cards = llm.generate_cards_from_file(pdf_path)
        
        print(f"✅ Successfully generated {len(cards)} flashcards!\n")
        print("=" * 60)
        
        # Display cards
        for i, card in enumerate(cards, 1):
            difficulty = card.get('difficulty', 'basic')
            difficulty_emoji = {'basic': '🟢', 'intermediate': '🟡', 'advanced': '🔴'}.get(difficulty, '⚪')
            
            print(f"\n{'─' * 60}")
            print(f"Card {i} {difficulty_emoji} {difficulty.upper()}")
            print(f"{'─' * 60}")
            print(f"\n❓ QUESTION:")
            print(f"   {card['front']}")
            print(f"\n✅ ANSWER:")
            print(f"   {card['back']}")
            
            if card.get('hint'):
                print(f"\n💡 HINT:")
                print(f"   {card['hint']}")
            
            if card.get('tags'):
                print(f"\n🏷️  TAGS: {', '.join(card['tags'])}")
            
            if card.get('visual_payload'):
                print(f"\n🎨 VISUAL: [SVG diagram included]")
        
        print(f"\n{'=' * 60}")
        print(f"📊 SUMMARY")
        print(f"{'=' * 60}")
        print(f"Total Cards: {len(cards)}")
        
        # Count by difficulty
        difficulties = {}
        for card in cards:
            d = card.get('difficulty', 'basic')
            difficulties[d] = difficulties.get(d, 0) + 1
        
        for d, count in difficulties.items():
            print(f"  - {d.capitalize()}: {count}")
        
        # Save to JSON for inspection
        output_path = pdf_path.replace('.pdf', '_flashcards.json')
        with open(output_path, 'w') as f:
            json.dump(cards, f, indent=2)
        print(f"\n💾 Cards saved to: {output_path}")
        
    except Exception as e:
        print(f"❌ Error generating flashcards: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Default PDF path
    pdf_path = "/Users/harshit/Documents/projects/recallforge/testing_pdfs/kech102.pdf"
    
    # Allow override from command line
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    
    test_pdf_flashcard_generation(pdf_path)
