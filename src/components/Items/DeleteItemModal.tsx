import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemName?: string;
}

const DeleteItemModal = ({ isOpen, onClose, onDelete, itemName }: DeleteItemModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Item
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete {itemName}? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete} 
              ml={3}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteItemModal; 