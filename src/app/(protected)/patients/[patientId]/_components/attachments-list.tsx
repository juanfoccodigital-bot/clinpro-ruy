"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DownloadIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  InfoIcon,
  PaperclipIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { medicalAttachmentsTable } from "@/db/schema";

interface AttachmentsListProps {
  patientId: string;
  attachments: (typeof medicalAttachmentsTable.$inferSelect)[];
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return <FileImageIcon className="h-8 w-8 text-blue-500" />;
  }
  if (fileType === "application/pdf") {
    return <FileTextIcon className="h-8 w-8 text-red-500" />;
  }
  return <FileIcon className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentsList = ({
  attachments,
}: AttachmentsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Anexos</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <InfoIcon className="text-muted-foreground h-4 w-4" />
            <CardDescription>
              Upload de arquivos será habilitado em breve
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {attachments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PaperclipIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Nenhum anexo encontrado
            </p>
            <p className="text-muted-foreground text-xs">
              Os anexos do paciente aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-sm">
                    {attachment.fileName}
                  </CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(attachment.fileSizeInBytes)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {format(
                        new Date(attachment.createdAt),
                        "dd/MM/yyyy",
                        { locale: ptBR },
                      )}
                    </span>
                  </div>
                  {attachment.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {attachment.description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsList;
