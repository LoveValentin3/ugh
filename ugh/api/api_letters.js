// API Route: /api/letters
// Send and receive letters between kids and elves

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify token
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// Generate AI elf response using OpenAI
async function generateElfResponse(letterContent, elf, kidName) {
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
        // Return a fallback response if no API key
        const fallbackResponses = [
            `Oh my jingle bells, ${kidName}! Thank you so much for your wonderful letter! Life at the North Pole is so magical right now - we're busy making toys and singing carols! I love being your elf friend. Keep being amazing! 🎄❄️ Your friend forever, ${elf.name}`,
            `Dear ${kidName}! Your letter made all the elves do a happy dance! We love hearing from you! The reindeer say hi too - especially Rudolph! Santa showed me your letter and he's so proud of you! ⭐🦌 Warmly, ${elf.name}`,
            `What a lovely letter, ${kidName}! I read it to all my elf friends and they think you're wonderful! We're working hard making presents and thinking of all the nice children like you! Keep spreading joy and kindness! 🎁✨ Love, ${elf.name}`
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    try {
        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `You are ${elf.name}, a friendly and magical elf at the North Pole. Your job is "${elf.job}" and your personality is: "${elf.personality}". 
        
A child named ${kidName} has written you this letter:
"${letterContent}"

Write a warm, magical, fun, age-appropriate response (2-3 short paragraphs). Be encouraging and positive. Mention things about life at the North Pole, your job, Santa, reindeer, or the workshop. Sign off as ${elf.name}. Use 2-3 holiday emojis.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.8
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI error:', error);
        // Fallback response
        return `Dear ${kidName}! Thank you for your wonderful letter! I loved reading every word. Life at the North Pole is so exciting right now - we're all getting ready for the big day! Santa says hi, and the reindeer are practicing their flying. Keep being amazing! 🎄⭐ Your elf friend, ${elf.name}`;
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Please log in first!' });
    }

    try {
        // GET - Get letters
        if (req.method === 'GET') {
            if (user.type === 'kid') {
                // Get kid's letters
                const { data: letters, error } = await supabase
                    .from('letters')
                    .select(`
                        *,
                        elves (name, emoji, job)
                    `)
                    .eq('kid_id', user.id)
                    .order('sent_at', { ascending: false });
                
                if (error) throw error;
                return res.status(200).json(letters);
                
            } else if (user.type === 'parent') {
                // Get all letters from parent's kids
                const { data: kids } = await supabase
                    .from('kids')
                    .select('id, name')
                    .eq('parent_id', user.id);
                
                const kidIds = kids?.map(k => k.id) || [];
                
                if (kidIds.length === 0) {
                    return res.status(200).json([]);
                }
                
                const { data: letters, error } = await supabase
                    .from('letters')
                    .select(`
                        *,
                        kids (name),
                        elves (name, emoji)
                    `)
                    .in('kid_id', kidIds)
                    .order('sent_at', { ascending: false });
                
                if (error) throw error;
                return res.status(200).json(letters);
            }
        }
        
        // POST - Send a new letter
        if (req.method === 'POST') {
            if (user.type !== 'kid') {
                return res.status(403).json({ error: 'Only kids can send letters!' });
            }
            
            const { content } = req.body;
            
            if (!content || content.trim().length === 0) {
                return res.status(400).json({ error: 'Please write something in your letter!' });
            }
            
            // Get kid's selected elf and info
            const { data: kid } = await supabase
                .from('kids')
                .select('elf_id, name, parent_id')
                .eq('id', user.id)
                .single();
            
            if (!kid?.elf_id) {
                return res.status(400).json({ error: 'Please choose an elf friend first!' });
            }
            
            // Get elf details
            const { data: elf } = await supabase
                .from('elves')
                .select('*')
                .eq('id', kid.elf_id)
                .single();
            
            // Get parent's response mode
            const { data: parent } = await supabase
                .from('parents')
                .select('response_mode')
                .eq('id', kid.parent_id)
                .single();
            
            // Save the letter
            const { data: letter, error: insertError } = await supabase
                .from('letters')
                .insert([{
                    kid_id: user.id,
                    elf_id: kid.elf_id,
                    content: content.trim()
                }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            // Generate AI response if in AI mode
            if (parent?.response_mode === 'ai' || !parent?.response_mode) {
                const aiResponse = await generateElfResponse(content, elf, kid.name);
                
                // Save the response
                await supabase
                    .from('letters')
                    .update({ 
                        response: aiResponse, 
                        response_at: new Date().toISOString(),
                        responded_by: 'ai'
                    })
                    .eq('id', letter.id);
                
                letter.response = aiResponse;
                letter.responded_by = 'ai';
            }
            
            return res.status(200).json({ 
                message: `Letter sent to ${elf.name}! 📮✨`,
                letter: { ...letter, elves: elf }
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Letters error:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};
