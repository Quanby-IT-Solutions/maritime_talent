'use client';

import { useState, useRef, useCallback } from 'react';
import { SignatureCanvas } from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download } from 'lucide-react';

interface ESignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignatureSave: (signature: string) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

const ESignModal = ({
  open,
  onOpenChange,
  onSignatureSave,
  trigger,
  title = 'Electronic Signature',
  description = 'Draw your signature in the field below'
}: ESignModalProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);

  const clearSignature = useCallback(() => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setIsSigned(false);
    }
  }, []);

  const saveSignature = useCallback(() => {
    if (sigCanvasRef.current && sigCanvasRef.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }

    if (sigCanvasRef.current) {
      const signatureDataUrl = sigCanvasRef.current.toDataURL('image/png');
      onSignatureSave(signatureDataUrl);
      onOpenChange(false);
    }
  }, [onSignatureSave, onOpenChange]);

  const handleBeginStroke = useCallback(() => {
    setIsSigned(false);
  }, []);

  const handleEndStroke = useCallback(() => {
    setIsSigned(!sigCanvasRef.current?.isEmpty());
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{ 
                className: 'w-full h-64 bg-white',
                style: { 
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }
              }}
              onBegin={handleBeginStroke}
              onEnd={handleEndStroke}
              backgroundColor="rgb(255, 255, 255)"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={isSigned ? "default" : "secondary"} 
              className="text-xs"
            >
              {isSigned ? 'Signed' : 'Not signed'}
            </Badge>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!isSigned}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => clearSignature(), 300);
            }}
          >
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (sigCanvasRef.current) {
                  const signatureDataUrl = sigCanvasRef.current.toDataURL('image/png');
                  // Create a temporary link to download the signature
                  const link = document.createElement('a');
                  link.download = 'signature.png';
                  link.href = signatureDataUrl;
                  link.click();
                }
              }}
              disabled={!isSigned}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              type="button"
              onClick={saveSignature}
              disabled={!isSigned}
            >
              Save Signature
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ESignModal;