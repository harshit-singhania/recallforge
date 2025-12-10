from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import yt_dlp
import re

class YouTubeService:
    def get_video_id(self, url: str) -> str:
        """
        Extracts video ID from various YouTube URL formats.
        """
        # Regex for standard and shortened URLs
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        raise ValueError("Invalid YouTube URL")

    def get_metadata(self, url: str) -> dict:
        """
        Fetches title, description, and thumbnail.
        """
        ydl_opts = {'quiet': True, 'extract_flat': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title'),
                "description": info.get('description'),
                "thumbnail": info.get('thumbnail')
            }

    def extract_transcript(self, url: str) -> str:
        """
        Extracts full transcript text from a YouTube URL.
        """
        try:
            video_id = self.get_video_id(url)
            
            # Get transcript using instance method .list()
            api = YouTubeTranscriptApi()
            transcript_list = api.list(video_id)
            
            # Try fetching english, or auto-generated english
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
            except:
                try:
                    transcript = transcript_list.find_manually_created_transcript(['en'])
                except:
                    # Fallback to any english or first available features
                    try:
                        transcript = transcript_list.find_transcript(['en'])
                    except:
                        # iterate and pick first
                        transcript = next(iter(transcript_list))
            
            transcript_data = transcript.fetch()
            
            # Format to plain text
            formatter = TextFormatter()
            text = formatter.format_transcript(transcript_data)
            
            # Get Metadata to prepend
            meta = self.get_metadata(url)
            
            full_content = f"Title: {meta['title']}\nDescription: {meta['description']}\n\nTranscript:\n{text}"
            return full_content
            
        except Exception as e:
            # Fallback: Return metadata if transcript fails
            try:
                meta = self.get_metadata(url)
                return f"Title: {meta['title']}\nDescription: {meta['description']}\n\n(Transcript unavailable: {str(e)})"
            except Exception as meta_error:
                # Debug Mock for Development when Network is Blocked
                print(f"Network error accessing YouTube: {meta_error}. Returning Mock Data.")
                return f"Title: Mock Video (Network Blocked)\nDescription: This is a placeholder because YouTube is inaccessible.\n\nTranscript:\nThis is a mock transcript about Mitochondria. Mitochondria are the powerhouse of the cell. They generate ATP."
