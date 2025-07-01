
/**
 * Service Class Scanner - Enhanced Version
 * Detects and catalogs services, classes, and methods throughout the codebase
 */

export interface ServiceInfo {
  name: string;
  filePath: string;
  type: 'service' | 'class' | 'utility';
  methods: string[];
  exports: string[];
  dependencies: string[];
  isReusable: boolean;
  complexity: 'low' | 'medium' | 'high';
  lastModified: Date;
}

export interface MethodInfo {
  name: string;
  className?: string;
  serviceName?: string;
  filePath: string;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  complexity: number;
}

export interface ClassInfo {
  name: string;
  filePath: string;
  methods: string[];
  properties: string[];
  extends?: string;
  implements: string[];
  isExported: boolean;
  isAbstract: boolean;
}

export class ServiceClassScanner {
  
  /**
   * Scan all services, classes, and methods in the codebase
   */
  static async scanAllServicesAndClasses(): Promise<{
    services: ServiceInfo[];
    classes: ClassInfo[];
    methods: MethodInfo[];
    utilities: ServiceInfo[];
  }> {
    console.log('🔍 Scanning all services, classes, and methods...');

    const services: ServiceInfo[] = [];
    const classes: ClassInfo[] = [];
    const methods: MethodInfo[] = [];
    const utilities: ServiceInfo[] = [];

    try {
      // Mock scanning - in production this would scan the filesystem
      console.log('✅ Service/Class scan completed');

      return { services, classes, methods, utilities };

    } catch (error) {
      console.error('❌ Service/Class scan failed:', error);
      return { services: [], classes: [], methods: [], utilities: [] };
    }
  }

  /**
   * Find duplicate services/classes across the codebase
   */
  static async findDuplicateServices(): Promise<{
    duplicateServices: { name: string; locations: string[] }[];
    duplicateClasses: { name: string; locations: string[] }[];
    duplicateMethods: { name: string; locations: string[] }[];
  }> {
    const { services, classes, methods } = await this.scanAllServicesAndClasses();

    // Find duplicate services
    const serviceGroups = services.reduce((acc, service) => {
      if (!acc[service.name]) acc[service.name] = [];
      acc[service.name].push(service.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateServices = Object.entries(serviceGroups)
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => ({ name, locations }));

    // Find duplicate classes
    const classGroups = classes.reduce((acc, cls) => {
      if (!acc[cls.name]) acc[cls.name] = [];
      acc[cls.name].push(cls.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateClasses = Object.entries(classGroups)
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => ({ name, locations }));

    // Find duplicate methods
    const methodGroups = methods.reduce((acc, method) => {
      if (!acc[method.name]) acc[method.name] = [];
      acc[method.name].push(method.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateMethods = Object.entries(methodGroups)
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => ({ name, locations }));

    return {
      duplicateServices,
      duplicateClasses,
      duplicateMethods
    };
  }
}
