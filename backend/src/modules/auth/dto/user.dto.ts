export interface LoginResponseDto {
  access_token: string;
  response: {
    id: string;
    email: string;
    full_name: string;
  };
}
