export type TicketStatus = 'OPEN' | 'PENDING' | 'DONE';
export type TicketPriority = 'high' | 'medium' | 'low';

export type Archetype =
  | 'service-health'
  | 'document-upload'
  | 'partner-sync'
  | 'erp-write-path'
  | 'monitoring-data';

export interface TicketFixture {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  customer_id: number;
  customer_name: string;
  tags: string[];
  created_at: string;
}

export interface SystemFixture {
  ip: string;
  port: number;
  username: 'azureuser';
  os: 'Ubuntu 22.04 LTS';
  notes?: string;
}

export interface CustomerSystemFixture {
  ticket_id: number;
  customer_id: number;
  system: SystemFixture;
}

export interface ServiceHealthParams {
  serviceName: string;
  port: number;
  healthPath: string;
}

export interface DocumentUploadParams {
  serviceName: string;
  serviceUser: string;
  serviceUid: number;
  port: number;
  rootDir: string;
  uploadDir: string;
  existingDir: string;
}

export interface PartnerSyncParams {
  partnerService: string;
  syncService: string;
  partnerHost: string;
  goodIp: string;
  badIp: string;
  partnerPort: number;
  statusPath: string;
}

export interface ErpWritePathParams {
  databaseName: string;
  appRole: string;
  appPassword: string;
  tableName: string;
  sequenceName: string;
}

export interface MonitoringDataParams {
  customerAppService: string;
  customerAppPort: number;
  dashboardService: string;
  dashboardPort: number;
  ingestService: string;
  ingestPort: number;
  agentService: string;
  configFile: string;
  correctEndpoint: string;
  badEndpoint: string;
}

export type ScenarioParams =
  | { archetype: 'service-health'; params: ServiceHealthParams }
  | { archetype: 'document-upload'; params: DocumentUploadParams }
  | { archetype: 'partner-sync'; params: PartnerSyncParams }
  | { archetype: 'erp-write-path'; params: ErpWritePathParams }
  | { archetype: 'monitoring-data'; params: MonitoringDataParams };

export type Scenario = ScenarioParams & {
  ticket: TicketFixture;
  system: SystemFixture;
};
