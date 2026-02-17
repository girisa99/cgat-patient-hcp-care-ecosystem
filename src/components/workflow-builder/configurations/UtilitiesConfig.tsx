import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Wrench, Code, FileText, Calculator, Database, Plus, Trash2, Clock } from 'lucide-react';

interface UtilitiesConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const UtilitiesConfig: React.FC<UtilitiesConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderCommonConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Flow State & Memory Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableFlowState"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Flow State</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Memory</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableMemory && (
          <FormField
            control={form.control}
            name="memoryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'cache'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cache">💾 Cache Memory</SelectItem>
                    <SelectItem value="temp">⏱️ Temporary Memory</SelectItem>
                    <SelectItem value="persistent">💿 Persistent Memory</SelectItem>
                    <SelectItem value="shared">🤝 Shared Memory</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableJsonOutput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>JSON Structured Output</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addKnowledge"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Add Knowledge Base</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableJsonOutput && (
          <FormField
            control={form.control}
            name="jsonSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JSON Output Schema</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {"result": {"type": "string"}, "metadata": {"type": "object"}, "timestamp": {"type": "string"}}}'
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderTextProcessor = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          Text Processing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="processingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tokenize">🔤 Tokenization</SelectItem>
                  <SelectItem value="clean">🧹 Text Cleaning</SelectItem>
                  <SelectItem value="normalize">📏 Normalization</SelectItem>
                  <SelectItem value="extract">🔍 Text Extraction</SelectItem>
                  <SelectItem value="format">📝 Format Conversion</SelectItem>
                  <SelectItem value="validate">✅ Text Validation</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.processingType === 'tokenize' && (
          <FormField
            control={form.control}
            name="tokenizer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tokenizer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'word'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="word">📝 Word Tokenizer</SelectItem>
                    <SelectItem value="sentence">📄 Sentence Tokenizer</SelectItem>
                    <SelectItem value="bpe">🔤 BPE Tokenizer</SelectItem>
                    <SelectItem value="subword">🔠 Subword Tokenizer</SelectItem>
                    <SelectItem value="custom">⚙️ Custom Tokenizer</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        {configuration.processingType === 'clean' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="removeHtml"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Remove HTML</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="removeUrls"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Remove URLs</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="removeEmojis"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Remove Emojis</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customCleaningRules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Cleaning Rules (Regex)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="/\d+/g,/[^\w\s]/g"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {configuration.processingType === 'extract' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="extractionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extraction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'entities'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entities">👤 Named Entities</SelectItem>
                      <SelectItem value="keywords">🔑 Keywords</SelectItem>
                      <SelectItem value="phrases">📝 Key Phrases</SelectItem>
                      <SelectItem value="patterns">🔍 Custom Patterns</SelectItem>
                      <SelectItem value="metadata">📊 Metadata</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {configuration.extractionType === 'patterns' && (
              <FormField
                control={form.control}
                name="extractionPatterns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extraction Patterns (Regex)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preserveFormatting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Preserve Formatting</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableBatchProcessing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Batch Processing</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDataTransformer = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-500" />
          Data Transformation Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="transformationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transformation Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transformation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="map">🗺️ Map Transform</SelectItem>
                  <SelectItem value="filter">🔍 Filter Transform</SelectItem>
                  <SelectItem value="reduce">📊 Reduce Transform</SelectItem>
                  <SelectItem value="merge">🔗 Merge Objects</SelectItem>
                  <SelectItem value="split">✂️ Split Data</SelectItem>
                  <SelectItem value="convert">🔄 Format Convert</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Transform</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.transformationType === 'custom' && (
          <FormField
            control={form.control}
            name="customTransformCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Transform Code</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="// JavaScript transformation function&#10;function transform(data) {&#10;  return data.map(item => ({...item, processed: true}));&#10;}"
                    rows={6}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {(configuration.transformationType === 'map' || configuration.transformationType === 'filter') && (
          <FormField
            control={form.control}
            name="transformExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transform Expression</FormLabel>
                <FormControl>
                  <Input
                    placeholder="item => item.value > 10"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.transformationType === 'convert' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sourceFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'json'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="json">📋 JSON</SelectItem>
                      <SelectItem value="xml">📄 XML</SelectItem>
                      <SelectItem value="csv">📊 CSV</SelectItem>
                      <SelectItem value="yaml">📝 YAML</SelectItem>
                      <SelectItem value="text">📰 Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'json'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="json">📋 JSON</SelectItem>
                      <SelectItem value="xml">📄 XML</SelectItem>
                      <SelectItem value="csv">📊 CSV</SelectItem>
                      <SelectItem value="yaml">📝 YAML</SelectItem>
                      <SelectItem value="text">📰 Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="validateInput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Validate Input</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validateOutput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Validate Output</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderMathCalculator = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-500" />
          Math Calculator Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="calculationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calculation Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">🔢 Basic Math</SelectItem>
                  <SelectItem value="advanced">📐 Advanced Math</SelectItem>
                  <SelectItem value="statistical">📊 Statistical</SelectItem>
                  <SelectItem value="financial">💰 Financial</SelectItem>
                  <SelectItem value="scientific">🔬 Scientific</SelectItem>
                  <SelectItem value="expression">📝 Expression Evaluator</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.calculationType === 'expression' && (
          <FormField
            control={form.control}
            name="defaultExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Expression</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Math.sqrt(x^2 + y^2)"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.calculationType === 'statistical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Statistical Functions</FormLabel>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="enableMean"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Mean</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableMedian"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Median</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableStdDev"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Std Dev</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="precision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimal Precision</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outputFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Format</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'number'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="number">🔢 Number</SelectItem>
                    <SelectItem value="string">📝 String</SelectItem>
                    <SelectItem value="scientific">🔬 Scientific</SelectItem>
                    <SelectItem value="percentage">📊 Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableErrorHandling"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Error Handling</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableVariables"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Variable Support</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderScheduler = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Scheduler Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="scheduleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="interval">⏰ Interval</SelectItem>
                  <SelectItem value="cron">📅 Cron Expression</SelectItem>
                  <SelectItem value="once">1️⃣ One Time</SelectItem>
                  <SelectItem value="delay">⏱️ Delayed Execution</SelectItem>
                  <SelectItem value="webhook">🔗 Webhook Trigger</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.scheduleType === 'interval' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="intervalValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intervalUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'minutes'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        )}

        {configuration.scheduleType === 'cron' && (
          <FormField
            control={form.control}
            name="cronExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cron Expression</FormLabel>
                <FormControl>
                  <Input placeholder="0 0 * * *" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.scheduleType === 'once' && (
          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="UTC" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxExecutions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Executions</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0 (unlimited)" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableRetry"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Retry</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Send Notifications</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'text_processor':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderTextProcessor()}
          </div>
        );
      case 'data_transformer':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderDataTransformer()}
          </div>
        );
      case 'math_calculator':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderMathCalculator()}
          </div>
        );
      case 'scheduler':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderScheduler()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderTextProcessor()}
            {renderDataTransformer()}
            {renderMathCalculator()}
            {renderScheduler()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};