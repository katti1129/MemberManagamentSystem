import { Member } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Get all members
  async getMembers(): Promise<Member[]> {
    const response = await fetch(`${API_BASE_URL}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    return response.json();
  },

  // Add new member
  async addMember(name: string): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add member');
    }
    
    return response.json();
  },

  // Delete member
  async deleteMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete member');
    }
  },
};