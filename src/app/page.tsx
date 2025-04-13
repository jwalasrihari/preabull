'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {generatePrecautions} from '@/ai/flows/generate-precautions';
import {interactiveMediAgent} from '@/ai/flows/interactive-mediagent';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {getDoctorTypes, DoctorType} from '@/services/doctor-type';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertTriangle} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {ScrollArea} from '@/components/ui/scroll-area';
import {FileUpload} from '@/components/ui/upload';

const formSchema = z.object({
  symptoms: z.string().min(2, {
    message: 'Symptoms must be at least 2 characters.',
  }),
  doctorType: z.string().min(2, {
    message: 'Doctor Type must be at least 2 characters.',
  }),
  report: z.any().optional(),
}).refine((data) => {
  const symptomDoctorMap: { [key: string]: string[] } = {
    'lung infection': ['Pulmonologist', 'General Physician'],
    'chest pain': ['Cardiologist', 'General Physician'],
    'skin rash': ['Dermatologist', 'General Physician'],
    'headache': ['Neurologist', 'General Physician'],
  };

  const symptoms = data.symptoms.toLowerCase();
  const doctorType = data.doctorType;

  for (const symptom in symptomDoctorMap) {
    if (symptoms.includes(symptom)) {
      if (!symptomDoctorMap[symptom].includes(doctorType)) {
        return false;
      }
      break;
    }
  }
  return true;
}, {
  message: 'The doctor type is not appropriate for the symptoms described.',
  path: ['doctorType'],
});

export default function Home() {
  const [precautions, setPrecautions] = useState<Awaited<ReturnType<typeof generatePrecautions>> | null>(null);
  const [doctorTypes, setDoctorTypes] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    {
      sender: 'user' | 'mediagent';
      message: string;
    }[]
  >([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [initialPrecautions, setInitialPrecautions] = useState('');
  const [mediAgentLoading, setMediAgentLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadDoctorTypes = async () => {
      try {
        const types = await getDoctorTypes();
        setDoctorTypes(types);
      } catch (e) {
        setError('Failed to load doctor types.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load doctor types.',
        });
      }
    };

    loadDoctorTypes();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
      doctorType: '',
      report: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setPrecautions(null);
    setChatHistory([]);
    setUserQuestion('');
    setChatOpen(false);

    let newReportUrl = reportUrl;

    try {
      const generatedPrecautions = await generatePrecautions({
        symptoms: values.symptoms,
        doctorType: values.doctorType,
        reportUrl: newReportUrl,
      });
      setPrecautions(generatedPrecautions);
      setInitialPrecautions(
        `Dietary Precautions: ${generatedPrecautions.dietPrecautions}\n` +
        `Sleep Precautions: ${generatedPrecautions.sleepPrecautions}\n` +
        `Physical Precautions: ${generatedPrecautions.physicalPrecautions}\n` +
        `Mental Precautions: ${generatedPrecautions.mentalPrecautions}\n` +
        `Things to Avoid: ${generatedPrecautions.thingsToAvoid}`
      );
    } catch (e: any) {
      setError(e.message || 'Failed to generate precautions.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e.message || 'Failed to generate precautions.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInteractiveSession = async () => {
    setChatOpen(true);
  };

  const handleQuestionSubmit = async () => {
    setMediAgentLoading(true);
    setError(null);

    const currentQuestion = userQuestion;
    setUserQuestion('');

    setChatHistory((prev) => [...prev, {sender: 'user', message: currentQuestion}]);

    try {
      const response = await interactiveMediAgent({
        initialPrecautions: initialPrecautions,
        userQuestion: currentQuestion,
      });

      setChatHistory((prev) => [...prev, {sender: 'mediagent', message: response.agentResponse}]);
    } catch (e: any) {
      setError(e.message || 'Failed to get interactive response.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e.message || 'Failed to get interactive response.',
      });
    } finally {
      setMediAgentLoading(false);
      // Scroll to the bottom of the chat after a new message is added
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <Card className="w-full max-w-2xl shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Pre-Consultation Guide</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your symptoms and the type of doctor you are consulting to generate personalized precautions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your symptoms"
                        className="resize-none shadow-sm rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Please provide a detailed description of your symptoms.
                    </FormDescription>
                    <FormMessage className="text-xs text-destructive">{form.formState.errors.symptoms?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorType"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Doctor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="shadow-sm rounded-md">
                          <SelectValue placeholder="Select a doctor type"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="shadow-md rounded-md">
                        {doctorTypes.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-muted-foreground">
                      Select the type of doctor you plan to consult.
                    </FormDescription>
                    <FormMessage className="text-xs text-destructive">{form.formState.errors.doctorType?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="report"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Previous Reports (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <FileUpload
                          onChange={(file: File | null) => {
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setReportUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setReportUrl(undefined);
                            }
                            field.onChange(file);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Upload a PDF or document containing previous medical reports.
                    </FormDescription>
                    <FormMessage className="text-xs text-destructive">{form.formState.errors.report?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="shadow-md rounded-md">
                {loading ? 'Generating...' : 'Generate Precautions'}
              </Button>
              {form.formState.errors.root && (
                <Alert variant="destructive" className="shadow-sm rounded-md">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="shadow-sm rounded-md">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {precautions && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Your Personalized Precautions</h2>
          <Card className="shadow-md rounded-lg">
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-lg font-semibold">Dietary Precautions</Label>
                  <p className="text-muted-foreground">{precautions?.dietPrecautions}</p>
                </div>
                <div>
                  <Label className="text-lg font-semibold">Sleep Precautions</Label>
                  <p className="text-muted-foreground">{precautions?.sleepPrecautions}</p>
                </div>
                <div>
                  <Label className="text-lg font-semibold">Physical Precautions</Label>
                  <p className="text-muted-foreground">{precautions?.physicalPrecautions}</p>
                </div>
                <div>
                  <Label className="text-lg font-semibold">Mental Precautions</Label>
                  <p className="text-muted-foreground">{precautions?.mentalPrecautions}</p>
                </div>
                <div>
                  <Label className="text-lg font-semibold">Things to Avoid</Label>
                  <p className="text-muted-foreground">{precautions?.thingsToAvoid}</p>
                </div>
              </div>
              <Button
                className="mt-4 shadow-md rounded-md"
                onClick={handleInteractiveSession}
                disabled={loading}
              >
                Contact MediAgent
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {chatOpen && precautions && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Chat with MediAgent</h2>
          <Card className="shadow-md rounded-lg">
            <CardContent>
              <div className="mb-4 h-[300px] overflow-y-auto" ref={chatContainerRef}>
                <ScrollArea className="rounded-md border p-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`mb-2 ${chat.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className={`font-bold ${chat.sender === 'user' ? 'text-blue-500' : 'text-green-500'}`}>
                        {chat.sender === 'user' ? 'You:' : 'MediAgent:'}
                      </span>
                      <p className="whitespace-pre-wrap">{chat.message}</p>
                    </div>
                  ))}
                  {mediAgentLoading && <p className="text-left">MediAgent is thinking...</p>}
                </ScrollArea>
              </div>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Ask MediAgent a question..."
                  className="flex-1 mr-2 shadow-sm rounded-md"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleQuestionSubmit();
                    }
                  }}
                />
                <Button type="button" onClick={handleQuestionSubmit} disabled={mediAgentLoading} className="shadow-md rounded-md">
                  {mediAgentLoading ? 'Sending...' : 'Send'}
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4 shadow-sm rounded-md">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
