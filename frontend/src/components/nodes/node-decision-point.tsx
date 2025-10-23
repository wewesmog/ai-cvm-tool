"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldError } from "@/components/ui/field";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  yesAction: z.string().min(1, "Yes action is required"),
  noAction: z.string().min(1, "No action is required"),
  yesDescription: z.string().optional(),
  noDescription: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NodeDecisionPointProps {
  nodeData?: any;
  formDataRef?: React.MutableRefObject<(() => FormData) | null>;
}

export const NodeDecisionPoint: React.FC<NodeDecisionPointProps> = ({
  nodeData,
  formDataRef,
}) => {
  const defaultValues: FormData = {
    title: nodeData?.title || "Decision Point",
    description: nodeData?.description || "",
    condition: nodeData?.condition || "",
    yesAction: nodeData?.yesAction || "Yes",
    noAction: nodeData?.noAction || "No",
    yesDescription: nodeData?.yesDescription || "",
    noDescription: nodeData?.noDescription || "",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Expose form data getter to parent via ref
  React.useEffect(() => {
    if (formDataRef) {
      formDataRef.current = () => form.getValues();
    }
  }, [form, formDataRef]);

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Decision Point Configuration</CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="general" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="Enter decision title" />
                      <FieldError errors={[fieldState.error]} />
                    </>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea 
                        {...field} 
                        placeholder="Describe this decision point"
                        rows={3}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Decision Condition</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="condition"
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea 
                        {...field} 
                        placeholder="e.g., Customer age > 25 AND subscription_type = 'premium'"
                        rows={3}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </>
                  )}
                />
              </FieldContent>
            </Field>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="branches" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              This decision point has exactly 2 branches: Yes and No. You can customize their labels and descriptions.
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Yes Branch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field>
                  <FieldLabel>Branch Label</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="yesAction"
                      render={({ field, fieldState }) => (
                        <>
                          <Input {...field} placeholder="Yes" />
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="yesDescription"
                      render={({ field, fieldState }) => (
                        <>
                          <Textarea 
                            {...field} 
                            placeholder="What happens when condition is true"
                            rows={2}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">No Branch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field>
                  <FieldLabel>Branch Label</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="noAction"
                      render={({ field, fieldState }) => (
                        <>
                          <Input {...field} placeholder="No" />
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="noDescription"
                      render={({ field, fieldState }) => (
                        <>
                          <Textarea 
                            {...field} 
                            placeholder="What happens when condition is false"
                            rows={2}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => form.reset()} className="flex-1">
                Reset
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
