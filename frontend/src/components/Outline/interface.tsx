export interface ObjectProps {
  name: string;
  cardRef: any;
}
export interface ProcessProps {
  id: string;
  name: string;
  icons: string[];
  agents: string[];
  cardRef: any;
  content: string;
}
export interface ObjectProcessCardProps {
  process: ProcessProps;
  inputs: ObjectProps[];
  outputs: ObjectProps[];
  cardRef: any;
  focusStep?: (stepId: string) => void;
  focusing: boolean;
}
