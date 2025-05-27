// Department Request Interface
export interface IDepartmentRequest {
    name: string;
    code?: string;
    description?: string;
    parentId?: number;
    status?: 'active' | 'inactive';
    sortOrder?: number;
}