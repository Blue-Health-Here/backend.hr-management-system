import { QueryFailedError } from 'typeorm';

export function parseDbError(error: any): { message: string; statusCode: number } {
    const DUPLICATE_ERROR_CODE = '23505';
    const FOREIGN_KEY_VIOLATION_CODE = '23503';

    if (error instanceof QueryFailedError) {
        const code = error.driverError?.code;
        const detail: string = error.driverError?.detail || '';
        const table: string = error.driverError?.table || 'Unknown Table';

        // Duplicate Entry Handling
        if (code === DUPLICATE_ERROR_CODE) {
            const message = parseDuplicateKeyDetail(detail, table);
            return {
                message,
                statusCode: 409
            };
        }

        // Foreign Key Violation Handling
        if (code === FOREIGN_KEY_VIOLATION_CODE) {
            return {
                message: 'Invalid reference. Related data not found (foreign key constraint failed).',
                statusCode: 422
            };
        }
    }

    // Default fallback
    return {
        message: 'Internal Server Error',
        statusCode: 500
    };
}

function parseDuplicateKeyDetail(detail: string, table: string): string {
    // Extract field names and values from the detail message
    // Supports formats like:
    // Key ("companyId", code)=(value1, value2) already exists.
    // Key (name)=(value) already exists.
    
    const keyMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists\./);
    
    if (!keyMatch) {
        return detail || 'Duplicate entry detected.';
    }

    const fieldsStr = keyMatch[1];
    
    // Parse field names - handle both quoted and unquoted field names
    const fieldNames = fieldsStr
        .split(',')
        .map(field => field.trim().replace(/"/g, ''));
    
    // Convert field names to readable format
    const readableFields = fieldNames.map(field => 
        field
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/id$/i, '') // Remove 'id' suffix
            .trim()
            .toLowerCase()
            .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
    );

    if (readableFields.length === 1) {
        return `${table} ${readableFields[0]} already exists.`;
    } else {
        return `${table} ${readableFields[1]} already exists.`;
    }
}