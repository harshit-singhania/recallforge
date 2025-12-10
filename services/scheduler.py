from datetime import timedelta
from django.utils import timezone

def calculate_next_review(rating, previous_ease=2.5, previous_interval=0, previous_repetitions=0):
    """
    Implements SM-2 Algorithm.
    rating: 0-5
    Returns: (new_ease, new_interval, new_repetitions, next_review_date)
    """
    if rating >= 3:
        if previous_repetitions == 0:
            interval = 1
        elif previous_repetitions == 1:
            interval = 6
        else:
            interval = round(previous_interval * previous_ease)
        
        repetitions = previous_repetitions + 1
    else:
        repetitions = 0
        interval = 1
    
    new_ease = previous_ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    if new_ease < 1.3:
        new_ease = 1.3
        
    next_review_date = timezone.now() + timedelta(days=interval)
    
    return new_ease, interval, repetitions, next_review_date
