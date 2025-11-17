declare namespace google {
  export namespace maps {
    export namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement);
        getPlace(): {
          formatted_address?: string;
          geometry?: {
            location: {
              lat: () => number;
              lng: () => number;
            };
          };
        };
        addListener(event: string, handler: () => void): void;
      }
    }
  }
}
