/**
 * Send a message to the chat bot and get a response using the IntelligentChatbot API
 * @param {string} message - The user's question
 * @param {string} context - Current lecture context (optional)
 * @param {number} courseId - Course ID for context (will be set to 1)
 * @param {string} threadId - Thread ID for conversation continuity
 * @returns {Promise<{response: string, threadId: string}>} - The bot's response and thread ID
 */
export const sendChatMessage = async (message, context = '', courseId = 1, threadId = '') => {
    // Always use customerId and cpCourseDetailId as 1 for now
    const customerId = 1;
    const cpCourseDetailId = 1;
    try {
        const requestBody = {
            customerId: customerId,
            cpCourseDetailId: cpCourseDetailId,
            question: message,
            threadId: threadId || ''
        };

        const response = await fetch('https://chatbot.thetechmenders.com/api/CourseQuestion/ask', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to get response from IntelligentChatbot API');
        }

        const data = await response.json();
        // Handle the CourseQuestion API response
        if (data && data.success && data.data && data.data.answer) {
            return {
                response: data.data.answer.trim(),
                threadId: data.data.threadId || threadId
            };
        } else if (data && data.message) {
            return {
                response: `Sorry, I encountered an error: ${data.message}`,
                threadId: threadId
            };
        } else {
            return {
                response: 'I received your question but couldn\'t generate a response. Could you try asking in a different way?',
                threadId: threadId
            };
        }
    } catch (error) {
        console.error('IntelligentChatbot API Error:', error);
        
        // Fallback to mock responses if API fails
        const fallbackResponse = await getFallbackResponse(message);
        return {
            response: fallbackResponse,
            threadId: threadId
        };
    }
};

/**
 * Fallback responses when the search API is unavailable
 * @param {string} message - The user's question
 * @returns {Promise<string>} - Fallback response
 */
const getFallbackResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = message.toLowerCase();

    // Medical/pediatric cardiology specific responses
    if (lowerMessage.includes('fetal') && lowerMessage.includes('circulation')) {
        return 'Fetal circulation is a unique cardiovascular system that allows the fetus to receive oxygenated blood from the placenta. Key features include:\n\n• Foramen ovale: Allows blood to flow from right to left atrium\n• Ductus arteriosus: Connects pulmonary artery to aorta\n• Ductus venosus: Bypasses the liver\n• Umbilical vessels: Connect to placenta for gas exchange\n\nThis system changes dramatically at birth when the baby starts breathing air.';
    }

    if (lowerMessage.includes('ductus') && lowerMessage.includes('arteriosus')) {
        return 'The ductus arteriosus is a vital fetal blood vessel that connects the pulmonary artery to the aorta. In fetal life, it allows most blood from the right ventricle to bypass the non-functioning lungs and go directly to the systemic circulation. After birth, it typically closes within 24-48 hours as the baby begins breathing and pulmonary resistance drops.';
    }

    if (lowerMessage.includes('pediatric') && lowerMessage.includes('cardiology')) {
        return 'Pediatric cardiology focuses on diagnosing and treating heart conditions in children from birth through adolescence. This includes congenital heart defects (present at birth) and acquired heart diseases. The field requires understanding of how the cardiovascular system develops and changes from fetal life through adulthood.';
    }

    if (lowerMessage.includes('congenital') && lowerMessage.includes('heart')) {
        return 'Congenital heart defects are structural problems with the heart that are present at birth. They occur in about 8-10 per 1,000 live births. Common types include:\n\n• Ventricular septal defects (VSD)\n• Atrial septal defects (ASD)\n• Patent ductus arteriosus (PDA)\n• Tetralogy of Fallot\n• Transposition of the great arteries\n\nMany can be treated with surgery or catheter-based procedures.';
    }

    // General fallback responses
    if (lowerMessage.includes('what') && lowerMessage.includes('topic')) {
        return 'This lecture covers important concepts in pediatric cardiology. The main focus is on understanding the fundamental principles of cardiac anatomy, physiology, and common conditions affecting children.';
    }

    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('works'))) {
        return 'Great question! Let me break this down step by step:\n\n1. First, we establish the foundation\n2. Then we apply the concept\n3. Finally, we see the results\n\nWould you like me to explain any specific part in more detail?';
    }

    if (lowerMessage.includes('why')) {
        return 'That\'s an important question! Understanding the "why" helps us grasp the clinical significance and apply these concepts in patient care.';
    }

    if (lowerMessage.includes('example') || lowerMessage.includes('examples')) {
        return 'Sure! Here\'s a practical example from pediatric cardiology:\n\nA newborn with a heart murmur might have a ventricular septal defect. The cardiologist would:\n- Perform echocardiography to visualize the defect\n- Monitor for symptoms like poor weight gain\n- Consider medical management or surgical closure if needed\n\nThis demonstrates how anatomical knowledge guides clinical decision-making.';
    }

    // Default response
    return 'I can help you with questions about pediatric cardiology, fetal circulation, congenital heart defects, and related topics. Could you be more specific about what you\'d like to know? For example, you can ask about:\n\n• Fetal circulation and neonatal adaptation\n• Specific heart conditions in children\n• How the heart develops\n• Diagnostic procedures in pediatric cardiology';
};

/**
 * Get suggested questions based on the current lecture
 * @param {string} lectureContent - Current lecture content
 * @returns {Array<string>} - Array of suggested questions
 */
export const getSuggestedQuestions = (lectureContent) => {
    const medicalQuestions = [
        'What is fetal circulation and how does it differ from adult circulation?',
        'Can you explain the ductus arteriosus and its function?',
        'What are the most common congenital heart defects in newborns?',
        'How does the heart adapt from fetal to neonatal life?',
        'What is the role of the foramen ovale in fetal circulation?',
        'Can you explain pediatric cardiology basics?',
        'What are the key differences between pediatric and adult cardiac physiology?',
        'How is congenital heart disease diagnosed in infants?'
    ];

    // If lecture content contains specific keywords, return relevant questions
    if (lectureContent) {
        const lowerContent = lectureContent.toLowerCase();
        
        if (lowerContent.includes('fetal') || lowerContent.includes('circulation')) {
            return [
                'What is fetal circulation and how does it differ from adult circulation?',
                'Can you explain the ductus arteriosus and its function?',
                'What is the role of the foramen ovale in fetal circulation?',
                'How does the heart adapt from fetal to neonatal life?'
            ];
        }
        
        if (lowerContent.includes('congenital') || lowerContent.includes('heart')) {
            return [
                'What are the most common congenital heart defects in newborns?',
                'How is congenital heart disease diagnosed in infants?',
                'What are the treatment options for congenital heart defects?',
                'Can you explain the difference between VSD and ASD?'
            ];
        }
        
        if (lowerContent.includes('pediatric') || lowerContent.includes('cardiology')) {
            return [
                'What are the key differences between pediatric and adult cardiac physiology?',
                'Can you explain pediatric cardiology basics?',
                'How do you assess cardiac function in children?',
                'What are the unique challenges in pediatric cardiac care?'
            ];
        }
    }

    // Return general medical questions if no specific content match
    return medicalQuestions.slice(0, 4);
};

/**
 * Clear a chat thread/conversation
 * @param {string} threadId - The thread ID to clear
 * @returns {Promise<{success: boolean}>}
 */
export const clearChatThread = async (threadId) => {
    if (!threadId) {
        return { success: true };
    }
    
    try {
        // If there's an API endpoint to clear threads, call it here
        // For now, just return success as the frontend handles the reset
        console.log('Clearing chat thread:', threadId);
        return { success: true };
    } catch (error) {
        console.error('Error clearing chat thread:', error);
        return { success: false };
    }
};

// TODO: Replace with actual API implementation
// Example implementation:
/*
export const sendChatMessage = async (message, context = '') => {
    try {
        const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YOUR_API_KEY}`
            },
            body: JSON.stringify({
                message,
                context,
                // Add any other required parameters
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from chat API');
        }

        const data = await response.json();
        return data.response; // Adjust based on your API response structure
    } catch (error) {
        console.error('Chat API Error:', error);
        throw error;
    }
};
*/
