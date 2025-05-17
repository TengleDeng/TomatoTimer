import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  // Fetch user settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // State for form values
  const [formValues, setFormValues] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    darkMode: false,
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormValues({
        workDuration: settings.workDuration / 60,
        breakDuration: settings.breakDuration / 60,
        longBreakDuration: settings.longBreakDuration / 60,
        sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
        autoStartBreaks: settings.autoStartBreaks,
        autoStartPomodoros: settings.autoStartPomodoros,
        darkMode: settings.darkMode,
      });
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<Settings>) => {
      const res = await apiRequest("PUT", "/api/settings", updatedSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSaveSettings = () => {
    // Convert minutes to seconds for durations
    saveSettingsMutation.mutate({
      userId: settings?.userId,
      workDuration: formValues.workDuration * 60,
      breakDuration: formValues.breakDuration * 60,
      longBreakDuration: formValues.longBreakDuration * 60,
      sessionsBeforeLongBreak: formValues.sessionsBeforeLongBreak,
      autoStartBreaks: formValues.autoStartBreaks,
      autoStartPomodoros: formValues.autoStartPomodoros,
      darkMode: formValues.darkMode,
    });
    
    // Update theme
    setTheme(formValues.darkMode ? "dark" : "light");
  };

  // Handle input changes
  const handleInputChange = (field: string, value: number | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return <div className="py-8 text-center">{t('app.loading')}</div>;
  }

  return (
    <>
      <header className="py-4">
        <h1 className="text-2xl font-medium">{t('settings.title')}</h1>
      </header>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('timer.title')}</CardTitle>
            <CardDescription>
              {t('settings.workDuration')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="workDuration">{t('settings.workDuration')}</Label>
                <span>{formValues.workDuration} {t('settings.minutes')}</span>
              </div>
              <Slider
                id="workDuration"
                value={[formValues.workDuration]}
                min={1}
                max={60}
                step={1}
                onValueChange={(value) => handleInputChange("workDuration", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="breakDuration">{t('settings.breakDuration')}</Label>
                <span>{formValues.breakDuration} {t('settings.minutes')}</span>
              </div>
              <Slider
                id="breakDuration"
                value={[formValues.breakDuration]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => handleInputChange("breakDuration", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="longBreakDuration">{t('settings.longBreakDuration')}</Label>
                <span>{formValues.longBreakDuration} {t('settings.minutes')}</span>
              </div>
              <Slider
                id="longBreakDuration"
                value={[formValues.longBreakDuration]}
                min={5}
                max={45}
                step={1}
                onValueChange={(value) => handleInputChange("longBreakDuration", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="sessionsBeforeLongBreak">{t('settings.sessionsBeforeLongBreak')}</Label>
                <span>{formValues.sessionsBeforeLongBreak} {t('settings.sessions')}</span>
              </div>
              <Slider
                id="sessionsBeforeLongBreak"
                value={[formValues.sessionsBeforeLongBreak]}
                min={1}
                max={8}
                step={1}
                onValueChange={(value) => handleInputChange("sessionsBeforeLongBreak", value[0])}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoStartBreaks">{t('settings.autoStartBreaks')}</Label>
              <Switch
                id="autoStartBreaks"
                checked={formValues.autoStartBreaks}
                onCheckedChange={(checked) => handleInputChange("autoStartBreaks", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoStartPomodoros">{t('settings.autoStartPomodoros')}</Label>
              <Switch
                id="autoStartPomodoros"
                checked={formValues.autoStartPomodoros}
                onCheckedChange={(checked) => handleInputChange("autoStartPomodoros", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('app.title')}</CardTitle>
            <CardDescription>
              {t('settings.language')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">{t('settings.darkMode')}</Label>
              <Switch
                id="darkMode"
                checked={formValues.darkMode}
                onCheckedChange={(checked) => handleInputChange("darkMode", checked)}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value as 'zh' | 'en')}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder={t('settings.language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">{t('language.zh')}</SelectItem>
                  <SelectItem value="en">{t('language.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
        >
          {t('app.save')}
        </Button>
      </div>
    </>
  );
}
