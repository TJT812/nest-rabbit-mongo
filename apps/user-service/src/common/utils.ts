import { lastValueFrom, Observable, retry, timeout } from 'rxjs';

const normalizeEmail = (email: string): string => email.toLocaleLowerCase();

const observe = (func: Observable<any>) => {
  return lastValueFrom(
    func.pipe(timeout(3000), retry({ count: 3, delay: 1000 })),
  );
};

export const utils = {
  normalizeEmail,
  observe,
};
