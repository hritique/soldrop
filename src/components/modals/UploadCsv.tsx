import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import ModalBase from './Base';

export default function UploadCsv({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (result: any) => void;
}) {
  const onFileLoad = useCallback(
    (files) => {
      if (files?.length > 0) {
        const csvFile = files[0];
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (e) => {
          const result = e?.target?.result;
          if (result) {
            onUploaded(result);
            onClose();
          }
        });

        fileReader.readAsText(csvFile);
      }
    },
    [onClose, onUploaded]
  );

  const { getRootProps } = useDropzone({
    onDrop: onFileLoad,
  });

  return (
    <ModalBase onClose={onClose}>
      <DropZone {...getRootProps()}>
        Click to Browse or Drag/Drop your CSV file here
        <input
          type="file"
          hidden
          onChange={(e) => onFileLoad(e.target.files)}
        />
      </DropZone>
    </ModalBase>
  );
}

const DropZone = styled.label`
  height: 16rem;
  width: 20rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #fff;
  border-radius: 0.5rem;
  background-color: #2c2c35;
  padding: 2rem;
  text-align: center;
  line-height: 1.6;
  cursor: pointer;
`;
