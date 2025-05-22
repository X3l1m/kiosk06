'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Check, Star, Trophy, ChevronRight, Calendar, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  choices?: string[];
  membershipTypeOptions?: boolean;
  membershipOptions?: boolean;
  dayPassOptions?: boolean;
  faqs?: boolean;
  selectedMembership?: string;
  personalDetailsForm?: boolean;
};

type FAQ = {
  question: string;
  answer: string;
};

// FAQs for each membership type
const membershipFAQs: Record<string, FAQ[]> = {
  Comfort: [
    {
      question: 'What facilities are included in Comfort?',
      answer: 'Comfort membership includes access to the gym floor, cardio equipment, and basic weights. Group classes are available at an additional fee.',
    },
    {
      question: 'What are the opening hours for Comfort members?',
      answer: 'Comfort members can access the gym from 6am to 10pm on weekdays, and 8am to 8pm on weekends.',
    },
    {
      question: 'Can I freeze my Comfort membership?',
      answer: 'Yes, you can freeze your Comfort membership for up to 1 month per year at no additional cost.',
    },
  ],
  Premium: [
    {
      question: 'What additional benefits do Premium members get?',
      answer: 'Premium members get everything in Comfort plus unlimited group classes, towel service, and access to the sauna and steam room.',
    },
    {
      question: 'Is there a limit on how many classes I can attend?',
      answer: 'No, Premium members can attend unlimited classes, subject to availability.',
    },
    {
      question: 'Do Premium members get guest passes?',
      answer: 'Yes, Premium members receive 2 guest passes per month.',
    },
  ],
  Ultimate: [
    {
      question: 'What makes Ultimate membership special?',
      answer: 'Ultimate members get all Premium benefits plus 1 personal training session per month, priority booking for classes, and 24/7 gym access.',
    },
    {
      question: 'How do I book my personal training session?',
      answer: 'You can book your monthly personal training session through our app or at the reception desk.',
    },
    {
      question: 'Can I use Ultimate membership at other locations?',
      answer: 'Yes, Ultimate membership includes access to all our locations nationwide.',
    },
  ],
  'Day Pass': [
    {
      question: "What's included in the Day Pass?",
      answer: 'The Day Pass gives you full access to the gym floor, cardio equipment, weights, and locker rooms for one day.',
    },
    {
      question: 'Can I attend classes with a Day Pass?',
      answer: 'Classes are not included in the standard Day Pass, but you can purchase a Day Pass Plus which includes one class.',
    },
    {
      question: 'What are the hours for Day Pass users?',
      answer: 'Day Pass users can access the gym from 8am to 8pm, seven days a week.',
    },
  ],
};

async function fetchAIResponse(messages: Message[]): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      // Hata kodunu ve cevabı konsola yazdır
      console.error('API response not ok:', res.status, await res.text());
      return "Sorry, I couldn't process your request right now.";
    }
    const data = await res.json();
    return data.message || "Sorry, I couldn't process your request right now.";
  } catch (err) {
    // Hata detayını konsola yazdır
    console.error('Fetch error:', err);
    return "Sorry, I couldn't process your request right now.";
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm Ruby. How can I help you today?",
      sender: 'assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<'recurring' | 'daypass' | null>(null);
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    // AI response
    const aiContent = await fetchAIResponse([...messages, newUserMessage]);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: aiContent,
        sender: 'assistant',
      },
    ]);
    setIsTyping(false);
  };

  const handleChoiceClick = async (choice: string) => {
    // Add user message with the selected choice
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: choice,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    // Membership flow
    if (choice === "I'd like to work out") {
      setTimeout(() => {
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: 'Great! Would you like a recurring membership or a day pass?',
          sender: 'assistant',
          membershipTypeOptions: true,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
        setIsTyping(false);
      }, 800);
      return;
    }

    if (choice === 'I need assistance') {
      setTimeout(() => {
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: "I'm here to help! What do you need assistance with?",
          sender: 'assistant',
          choices: ['Membership questions', 'Facility information', 'Class schedule', 'Contact us'],
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // AI response for other choices
    const aiContent = await fetchAIResponse([...messages, newUserMessage]);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: aiContent,
        sender: 'assistant',
      },
    ]);
    setIsTyping(false);
  };

  const handleMembershipTypeSelect = (type: 'recurring' | 'daypass') => {
    setMembershipType(type);

    // Add user message with the selected type
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: type === 'recurring' ? 'I want a recurring membership' : "I'd like a day pass",
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      if (type === 'recurring') {
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: 'Excellent! Please select a membership plan that suits your needs:',
          sender: 'assistant',
          membershipOptions: true,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
      } else {
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: 'Great choice! Here are our day pass options:',
          sender: 'assistant',
          dayPassOptions: true,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleMembershipSelect = (membership: string) => {
    setSelectedMembership(membership);

    // Add user message with the selected membership
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: `I'm interested in the ${membership}`,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: Date.now().toString(),
        content: `Excellent choice! To proceed with your ${membership} ${membershipType === 'recurring' ? 'membership' : 'day pass'}, please fill in your personal details:`,
        sender: 'assistant',
        personalDetailsForm: true,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handlePersonalDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add user message confirming details submission
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: "I've submitted my personal details.",
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: Date.now().toString(),
        content: `Thank you, ${personalDetails.firstName}! Your ${membershipType === 'recurring' ? 'membership' : 'day pass'} request has been received. Here are some frequently asked questions about your selection:`,
        sender: 'assistant',
        faqs: true,
        selectedMembership: selectedMembership || 'Day Pass',
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleFAQSelect = (faq: FAQ) => {
    // Add user message with the selected question
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: faq.question,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: Date.now().toString(),
        content: faq.answer,
        sender: 'assistant',
        choices: ['Ask another question', 'Select different membership', 'Complete registration'],
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#FFA500] to-[#FF4500] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-8 z-10">
        <h1 className="text-6xl font-bold text-white outline-text">HELLO</h1>
        <div className="mt-4">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-white mr-2">I'M</span>
            <span className="text-3xl font-bold bg-[#98e3d5] px-2">RUBY</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">YOUR VIRTUAL ASSISTANT</p>
        </div>
      </div>

      <div className="virtual-assistant">
        <div className="assistant-image"></div>
      </div>

      <div className="flex-1 flex flex-col justify-end pb-20 px-4 md:px-8 z-10 mt-48">
        {messages.length === 1 && (
          <div className="big-buttons-container mb-4">
            <Button onClick={() => handleChoiceClick("I'd like to work out")} className="big-button sport-button">
              I'd like to work out
            </Button>
            <Button onClick={() => handleChoiceClick('I need assistance')} className="big-button help-button">
              I need assistance
            </Button>
          </div>
        )}

        <div className="chat-container overflow-y-auto max-h-[50vh] w-full md:max-w-[85%] lg:max-w-[75%] space-y-4 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
              <Card className={cn('w-full md:max-w-[80%] p-3', message.sender === 'user' ? 'bg-white text-[#FF4500]' : 'bg-[#333] text-white border-none')}>
                <p>{message.content}</p>

                {message.choices && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.choices.map((choice) => (
                      <Badge key={choice} variant="outline" className="bg-[#98e3d5] text-[#333] hover:bg-[#FF4500] hover:text-white cursor-pointer transition-colors" onClick={() => handleChoiceClick(choice)}>
                        {choice}
                      </Badge>
                    ))}
                  </div>
                )}

                {message.membershipTypeOptions && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Card className="membership-type-card" onClick={() => handleMembershipTypeSelect('recurring')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Repeat className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Recurring Membership</h3>
                        <p className="text-sm mb-4">Join our community with a monthly or annual membership</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Flexible membership options</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Cancel anytime</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Member-only perks</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Recurring</Button>
                      </div>
                    </Card>

                    <Card className="membership-type-card" onClick={() => handleMembershipTypeSelect('daypass')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Day Pass</h3>
                        <p className="text-sm mb-4">Try our facilities with a single-day access pass</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>No commitment</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Full facility access</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Perfect for visitors</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Day Pass</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {message.membershipOptions && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <Card className="membership-card" onClick={() => handleMembershipSelect('Comfort')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Check className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Comfort</h3>
                        <p className="text-sm mb-2">Basic gym access with essential amenities</p>
                        <p className="text-xl font-bold text-[#FF4500] mb-2">$29.99/mo</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Gym floor access</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Cardio equipment</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Basic weights</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Comfort</Button>
                      </div>
                    </Card>

                    <Card className="membership-card border-[#FF4500]" onClick={() => handleMembershipSelect('Premium')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Star className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Premium</h3>
                        <p className="text-sm mb-2">Enhanced experience with added benefits</p>
                        <p className="text-xl font-bold text-[#FF4500] mb-2">$49.99/mo</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>All Comfort features</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Unlimited classes</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Sauna & steam room</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Premium</Button>
                      </div>
                    </Card>

                    <Card className="membership-card" onClick={() => handleMembershipSelect('Ultimate')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Trophy className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Ultimate</h3>
                        <p className="text-sm mb-2">Complete luxury fitness experience</p>
                        <p className="text-xl font-bold text-[#FF4500] mb-2">$79.99/mo</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>All Premium features</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>1 PT session monthly</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>24/7 access</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Ultimate</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {message.dayPassOptions && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="membership-card" onClick={() => handleMembershipSelect('Day Pass')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Calendar className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Standard Day Pass</h3>
                        <p className="text-sm mb-2">Full access for one day</p>
                        <p className="text-xl font-bold text-[#FF4500] mb-2">$19.99</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Gym floor access</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Cardio equipment</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Locker room</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Standard</Button>
                      </div>
                    </Card>

                    <Card className="membership-card" onClick={() => handleMembershipSelect('Day Pass Plus')}>
                      <div className="p-4 flex flex-col items-center text-center">
                        <Star className="h-8 w-8 text-[#FF4500] mb-2" />
                        <h3 className="text-lg font-bold mb-2">Day Pass Plus</h3>
                        <p className="text-sm mb-2">Premium day access with extras</p>
                        <p className="text-xl font-bold text-[#FF4500] mb-2">$29.99</p>
                        <ul className="text-sm text-left w-full mb-4">
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>All standard features</span>
                          </li>
                          <li className="flex items-start mb-1">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>One fitness class</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-[#FF4500] mr-2 mt-0.5" />
                            <span>Sauna & steam room</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-[#FF4500] hover:bg-[#FF6347]">Select Plus</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {message.personalDetailsForm && (
                  <form onSubmit={handlePersonalDetailsSubmit} className="mt-4 space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700">
                          First Name
                        </Label>
                        <Input id="firstName" name="firstName" value={personalDetails.firstName} onChange={handleInputChange} required className="border-gray-300 focus:border-[#FF4500] focus:ring-[#FF4500]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700">
                          Last Name
                        </Label>
                        <Input id="lastName" name="lastName" value={personalDetails.lastName} onChange={handleInputChange} required className="border-gray-300 focus:border-[#FF4500] focus:ring-[#FF4500]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input id="email" name="email" type="email" value={personalDetails.email} onChange={handleInputChange} required className="border-gray-300 focus:border-[#FF4500] focus:ring-[#FF4500]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number
                      </Label>
                      <Input id="phone" name="phone" type="tel" value={personalDetails.phone} onChange={handleInputChange} required className="border-gray-300 focus:border-[#FF4500] focus:ring-[#FF4500]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-gray-700">
                        Date of Birth
                      </Label>
                      <Input id="dateOfBirth" name="dateOfBirth" type="date" value={personalDetails.dateOfBirth} onChange={handleInputChange} required className="border-gray-300 focus:border-[#FF4500] focus:ring-[#FF4500]" />
                    </div>
                    <Button type="submit" className="w-full bg-[#FF4500] hover:bg-[#FF6347]">
                      Submit Details
                    </Button>
                  </form>
                )}

                {message.faqs && message.selectedMembership && (
                  <div className="mt-4 space-y-2">
                    {membershipFAQs[message.selectedMembership].map((faq, index) => (
                      <div key={index} className="p-2 bg-[#98e3d5] text-[#333] rounded-md hover:bg-[#FF4500] hover:text-white cursor-pointer flex items-center" onClick={() => handleFAQSelect(faq)}>
                        <ChevronRight className="h-4 w-4 mr-2" />
                        <span>{faq.question}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-[#333] text-white border-none">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white absolute bottom-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2 w-full max-w-[85%] lg:max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="text-[#FF4500] shrink-0">
            <Smile className="h-5 w-5" />
          </Button>

          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4500]" />

          <Button onClick={handleSend} className="bg-[#FF4500] hover:bg-[#FF6347] shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
