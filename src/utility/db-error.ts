import { QueryFailedError } from 'typeorm';

export function parseDbError(error: any): { message: string; statusCode: number } {
    const DUPLICATE_ERROR_CODE = '23505';
    const FOREIGN_KEY_VIOLATION_CODE = '23503'; // <--- New error code

    if (error instanceof QueryFailedError) {
        const code = error.driverError?.code;
        const detail: string = error.driverError?.detail || '';

        // Duplicate Entry Handling
        if (code === DUPLICATE_ERROR_CODE) {
            if (detail.includes('userName')) {
                return { message: 'Username already exists.', statusCode: 409 };
            }
            if (detail.includes('email')) {
                return { message: 'Email already exists.', statusCode: 409 };
            }
            if (detail.includes('name')) {
                return { message: 'Name already exists.', statusCode: 409 };
            }
            return {
                message: 'Duplicate entry detected.',
                statusCode: 409,
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
