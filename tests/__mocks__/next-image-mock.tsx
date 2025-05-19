import * as React from "react";

type ImageProps = {
	src?: string;
	alt?: string;
	className?: string;
	"data-testId"?: string;
};

export const NextImageMock = React.forwardRef<HTMLImageElement, ImageProps>(
	(props, ref) => {
		const { src, alt, className } = props;
		return (
			<img
				src={src}
				alt={alt}
				className={className}
				ref={ref}
				data-testId="logo"
			/>
		);
	},
);
NextImageMock.displayName = "NextImageMock";
