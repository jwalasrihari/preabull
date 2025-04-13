'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {generatePrecautions, GeneratePrecautionsOutput} from '@/ai/flows/generate-precautions';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {getDoctorTypes, DoctorType} from '@/services/doctor-type';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertTriangle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';

const formSchema = z.object({
  symptoms: z.string().min(2, {
    message: 'Symptoms must be at least 2 characters.',
  }),
  doctorType: z.string().min(2, {
    message: 'Doctor Type must be at least 2 characters.',
  }),
});

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure the utterance
    utterance.lang = 'en-US';
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Voice pitch

    // Speak the text
    synth.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser.');
  }
}

export default function Home() {
  const [precautions, setPrecautions] = useState<Awaited<ReturnType<typeof generatePrecautions>> | null>(null);
  const [doctorTypes, setDoctorTypes] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setPrecautions(null);

    try {
      const generatedPrecautions = await generatePrecautions(values);
      setPrecautions(generatedPrecautions);
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

  const handleSpeak = async () => {
    if (precautions) {
      setLoading(true);
      try {
        let fullText = 'Hello, I am MediAgent. Here are your personalized precautions:\n';
        fullText += `Dietary Precautions: ${precautions.dietPrecautions}\n`;
        fullText += `Sleep Precautions: ${precautions.sleepPrecautions}\n`;
        fullText += `Physical Precautions: ${precautions.physicalPrecautions}\n`;
        fullText += `Mental Precautions: ${precautions.mentalPrecautions}\n`;
        fullText += `Things to Avoid: ${precautions.thingsToAvoid}`;
        speak(fullText);
      } catch (e: any) {
        setError(e.message || 'Failed to generate spoken feedback.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: e.message || 'Failed to generate spoken feedback.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: 'No precautions generated',
        description: 'Please generate precautions first.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Pre-Consultation Guide</CardTitle>
          <CardDescription>Enter your symptoms and the type of doctor you are consulting to generate personalized precautions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your symptoms" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>Please provide a detailed description of your symptoms.</FormDescription>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctorTypes.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the type of doctor you plan to consult.</FormDescription>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Precautions'}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
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
          <Card>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>Dietary Precautions</Label>
                  <p>{precautions.dietPrecautions}</p>
                </div>
                <div>
                  <Label>Sleep Precautions</Label>
                  <p>{precautions.sleepPrecautions}</p>
                </div>
                <div>
                  <Label>Physical Precautions</Label>
                  <p>{precautions.physicalPrecautions}</p>
                </div>
                <div>
                  <Label>Mental Precautions</Label>
                  <p>{precautions.mentalPrecautions}</p>
                </div>
                <div>
                  <Label>Things to Avoid</Label>
                  <p>{precautions.thingsToAvoid}</p>
                </div>
              </div>
              <Button className="mt-4" onClick={handleSpeak} disabled={loading}>
                {loading ? 'Contacting MediAgent...' : 'Contact MediAgent'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
