import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpsService {
  constructor(private readonly httpService: HttpService) {}

  private buildRequestConfig(token: string) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async fetchData<T>(url: string, token: string): Promise<T> {
    const response = await firstValueFrom(this.httpService.get(url, this.buildRequestConfig(token)));

    return response.data;
  }

  async postData(url: string, data: any, token: string): Promise<any> {
    const response = firstValueFrom(this.httpService.post(url, data, this.buildRequestConfig(token)));

    return response;
  }
}
