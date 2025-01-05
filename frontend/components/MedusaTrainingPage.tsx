import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Text,
  Input,
  Image,
  IconButton,
  Box,
  Badge,
  Link,
  Icon,
  chakra
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Switch } from '@chakra-ui/switch';
import { useToast } from '@chakra-ui/toast';
import { Progress } from '@chakra-ui/progress';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/table';
import { CloseIcon, DownloadIcon } from '@chakra-ui/icons';
import { TrainingResponse } from '@/types/api';
import { ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';

interface TrainedModel {
  id: string;
  name: string;
  files: {
    lora: string;
    config: string;
  };
  status: 'completed' | 'failed' | 'processing';
  createdAt: string;
  userId: string;
}

export default function MedusaTrainingPage() {
  const [images, setImages] = useState<string[]>([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [loraName, setLoraName] = useState('');
  const [isStyle, setIsStyle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const toast = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrainedModels();
    }
  }, [session]);

  const fetchTrainedModels = async () => {
    try {
      const response = await fetch('/api/training/list');
      const data = await response.json();
      if (data.success) {
        setTrainedModels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trained models:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session?.user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to train LoRA models',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!loraName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please provide a name for your LoRA model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (images.length < 4) {
      toast({
        title: 'Not enough images',
        description: 'Please provide at least 4 images for training',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (images.length > 20) {
      toast({
        title: 'Too many images',
        description: 'Maximum 20 images allowed for training',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const response = await fetch('/api/training/character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: loraName.trim(),
          images,
          triggerWord: triggerWord.trim(),
          isStyle
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Training failed');
      }

      const data = result.data as TrainingResponse;

      toast({
        title: 'Training Complete',
        description: `Model "${loraName}" has been trained successfully`,
        status: 'success',
        duration: 10000,
        isClosable: true,
      });

      // Reset form
      setImages([]);
      setTriggerWord('');
      setLoraName('');
      setProgress(100);
      
      // Refresh the list of trained models
      fetchTrainedModels();
    } catch (error) {
      toast({
        title: 'Training Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const DownloadButtonIcon = () => <Icon as={DownloadIcon} />;
  const CloseButtonIcon = () => <Icon as={CloseIcon} />;

  return (
    <chakra.div p={6}>
      <chakra.div display="flex" flexDirection="column" gap={6}>
        <FormControl>
          <FormLabel>Training Type</FormLabel>
          <Switch
            isChecked={isStyle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setIsStyle(e.target.checked)}
            colorScheme="purple"
          />
          <Text ml={2} display="inline-block">
            {isStyle ? 'Style Training' : 'Character Training'}
          </Text>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>LoRA Name</FormLabel>
          <Input
            value={loraName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLoraName(e.target.value)}
            placeholder="Enter a name for your LoRA model"
            disabled={isLoading}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Trigger Word (Optional)</FormLabel>
          <Input
            value={triggerWord}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTriggerWord(e.target.value)}
            placeholder="Enter a trigger word"
            disabled={isLoading}
          />
        </FormControl>

        <div
          {...getRootProps()}
          style={{
            border: '2px dashed',
            borderColor: isDragActive ? 'purple.500' : 'gray.200',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <input {...getInputProps()} />
          <Text>
            {isDragActive
              ? 'Drop the images here...'
              : 'Drag & drop images here, or click to select'}
          </Text>
        </div>

        {images.length > 0 && (
          <chakra.div display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
            {images.map((image, index) => (
              <Box key={index} position="relative">
                <Image
                  src={image}
                  alt={`Training image ${index + 1}`}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <chakra.button
                  aria-label="Remove image"
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  bg="red.500"
                  color="white"
                  borderRadius="md"
                  p={2}
                  minW="24px"
                  h="24px"
                  fontSize="sm"
                  onClick={() => removeImage(index)}
                  opacity={isLoading ? 0.4 : 1}
                  cursor={isLoading ? 'not-allowed' : 'pointer'}
                  pointerEvents={isLoading ? 'none' : 'auto'}
                >
                  <Icon as={CloseIcon} />
                </chakra.button>
              </Box>
            ))}
          </chakra.div>
        )}

        {isLoading && <Progress value={progress} size="sm" colorScheme="purple" />}

        <chakra.button
          onClick={handleSubmit}
          bg="purple.500"
          color="white"
          borderRadius="md"
          p={4}
          opacity={isLoading || images.length === 0 || !loraName.trim() || !session?.user ? 0.4 : 1}
          cursor={isLoading || images.length === 0 || !loraName.trim() || !session?.user ? 'not-allowed' : 'pointer'}
          pointerEvents={isLoading || images.length === 0 || !loraName.trim() || !session?.user ? 'none' : 'auto'}
          _hover={{ bg: 'purple.600' }}
          _active={{ bg: 'purple.700' }}
        >
          {isLoading ? 'Training...' : 'Start Training'}
        </chakra.button>

        {session?.user && trainedModels.length > 0 && (
          <Box mt={8}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Your Trained Models
            </Text>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {trainedModels.map((model) => (
                    <Tr key={model.id}>
                      <Td>{model.name}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            model.status === 'completed'
                              ? 'green'
                              : model.status === 'failed'
                              ? 'red'
                              : 'yellow'
                          }
                        >
                          {model.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(model.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <chakra.div display="flex" gap={2}>
                          {model.status === 'completed' && (
                            <>
                              <Link href={model.files.lora} target="_blank" rel="noopener noreferrer">
                                <chakra.button
                                  bg="transparent"
                                  color="purple.500"
                                  border="1px solid"
                                  borderColor="purple.500"
                                  borderRadius="md"
                                  p={2}
                                  h="32px"
                                  fontSize="sm"
                                  _hover={{ bg: 'purple.50' }}
                                >
                                  <Icon as={DownloadIcon} mr={2} />
                                  LoRA
                                </chakra.button>
                              </Link>
                              <Link href={model.files.config} target="_blank" rel="noopener noreferrer">
                                <chakra.button
                                  bg="transparent"
                                  color="purple.500"
                                  border="1px solid"
                                  borderColor="purple.500"
                                  borderRadius="md"
                                  p={2}
                                  h="32px"
                                  fontSize="sm"
                                  _hover={{ bg: 'purple.50' }}
                                >
                                  <Icon as={DownloadIcon} mr={2} />
                                  Config
                                </chakra.button>
                              </Link>
                            </>
                          )}
                        </chakra.div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </chakra.div>
    </chakra.div>
  );
} 