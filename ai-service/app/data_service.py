"""Mock data service for students, modules, and resources.

This module provides sample data for development and testing.
In production, replace with actual database queries.
"""
from typing import Dict, List, Optional


# Mock student data with engagement metrics
STUDENTS_DATA = {
    1: {
        "student_id": 1,
        "name": "Alice Johnson",
        "avg_score": 85.5,
        "attendance_rate": 0.92,
        "assignment_completion": 0.95,
        "forum_participation": 45,
        "study_hours_per_week": 15,
        "previous_modules_passed": 8,
    },
    2: {
        "student_id": 2,
        "name": "Bob Smith",
        "avg_score": 72.3,
        "attendance_rate": 0.78,
        "assignment_completion": 0.80,
        "forum_participation": 12,
        "study_hours_per_week": 10,
        "previous_modules_passed": 6,
    },
    3: {
        "student_id": 3,
        "name": "Carol Williams",
        "avg_score": 91.2,
        "attendance_rate": 0.98,
        "assignment_completion": 1.0,
        "forum_participation": 67,
        "study_hours_per_week": 20,
        "previous_modules_passed": 10,
    },
}


# Mock module data
MODULES_DATA = {
    "CS101": {
        "module_code": "CS101",
        "name": "Introduction to Computer Science",
        "difficulty": "beginner",
        "topics": ["programming", "algorithms", "data-structures"],
        "avg_pass_rate": 0.82,
    },
    "CS201": {
        "module_code": "CS201",
        "name": "Data Structures and Algorithms",
        "difficulty": "intermediate",
        "topics": ["algorithms", "data-structures", "complexity"],
        "avg_pass_rate": 0.75,
    },
    "CS301": {
        "module_code": "CS301",
        "name": "Machine Learning Fundamentals",
        "difficulty": "advanced",
        "topics": ["machine-learning", "statistics", "python"],
        "avg_pass_rate": 0.68,
    },
    "MATH101": {
        "module_code": "MATH101",
        "name": "Calculus I",
        "difficulty": "beginner",
        "topics": ["calculus", "mathematics", "derivatives"],
        "avg_pass_rate": 0.79,
    },
}


# Mock learning resources
LEARNING_RESOURCES = [
    {
        "resource_id": "vid_001",
        "title": "Introduction to Python Programming",
        "url": "https://example.com/videos/python-intro",
        "type": "video",
        "topics": ["programming", "python"],
        "difficulty": "beginner",
    },
    {
        "resource_id": "art_001",
        "title": "Understanding Big O Notation",
        "url": "https://example.com/articles/big-o",
        "type": "article",
        "topics": ["algorithms", "complexity"],
        "difficulty": "intermediate",
    },
    {
        "resource_id": "ex_001",
        "title": "Binary Search Tree Exercises",
        "url": "https://example.com/exercises/bst",
        "type": "exercise",
        "topics": ["data-structures", "algorithms"],
        "difficulty": "intermediate",
    },
    {
        "resource_id": "quiz_001",
        "title": "Algorithm Complexity Quiz",
        "url": "https://example.com/quizzes/complexity",
        "type": "quiz",
        "topics": ["algorithms", "complexity"],
        "difficulty": "intermediate",
    },
    {
        "resource_id": "vid_002",
        "title": "Machine Learning Basics",
        "url": "https://example.com/videos/ml-basics",
        "type": "video",
        "topics": ["machine-learning", "statistics"],
        "difficulty": "advanced",
    },
    {
        "resource_id": "art_002",
        "title": "Derivatives and Integrals Guide",
        "url": "https://example.com/articles/calculus",
        "type": "article",
        "topics": ["calculus", "mathematics"],
        "difficulty": "beginner",
    },
    {
        "resource_id": "ex_002",
        "title": "Python Coding Challenges",
        "url": "https://example.com/exercises/python",
        "type": "exercise",
        "topics": ["programming", "python"],
        "difficulty": "beginner",
    },
    {
        "resource_id": "vid_003",
        "title": "Advanced Data Structures",
        "url": "https://example.com/videos/advanced-ds",
        "type": "video",
        "topics": ["data-structures", "algorithms"],
        "difficulty": "advanced",
    },
]


class DataService:
    """Service for accessing student, module, and resource data."""
    
    @staticmethod
    def get_student(student_id: int) -> Optional[Dict]:
        """Get student data by ID. Returns a generic student if not found."""
        student = STUDENTS_DATA.get(student_id)
        if not student:
            return {
                "student_id": student_id,
                "name": f"Student #{student_id}",
                "avg_score": 75.0,
                "attendance_rate": 0.85,
                "assignment_completion": 0.88,
                "forum_participation": 20,
                "study_hours_per_week": 12,
                "previous_modules_passed": 5,
            }
        return student
    
    @staticmethod
    def get_module(module_code: str) -> Optional[Dict]:
        """Get module data by code. Returns a generic module if not found."""
        module = MODULES_DATA.get(module_code)
        if not module:
            return {
                "module_code": module_code,
                "name": f"Module {module_code}",
                "difficulty": "intermediate",
                "topics": ["general", "learning", "development"],
                "avg_pass_rate": 0.75,
            }
        return module
    
    @staticmethod
    def get_resources_for_module(module_code: str, limit: int = 5) -> List[Dict]:
        """Get learning resources relevant to a module."""
        module = DataService.get_module(module_code)
        
        module_topics = set(module["topics"])
        
        # Filter resources by matching topics
        relevant_resources = [
            resource for resource in LEARNING_RESOURCES
            if any(topic in module_topics for topic in resource["topics"])
        ]
        
        # If no specific matches, return a slice of all resources
        if not relevant_resources:
            return LEARNING_RESOURCES[:limit]
            
        return relevant_resources[:limit]
    
    @staticmethod
    def get_all_students() -> Dict[int, Dict]:
        """Get all student data.
        
        Returns:
            Dictionary of all students
        """
        return STUDENTS_DATA
    
    @staticmethod
    def get_all_modules() -> Dict[str, Dict]:
        """Get all module data.
        
        Returns:
            Dictionary of all modules
        """
        return MODULES_DATA
