QUIZES = $(shell ls -d quiz*/ | sed 's/\///g' | awk 'NF{print $$0 ".zip"}')

.PHONY:
all: $(QUIZES)

.PHONY:
quiz%.zip: quiz% neon-matrix
	git archive HEAD -o $@ $?

.PHONY:
hw%.zip: hw% neon-matrix
	git archive HEAD -o $@ $?
	zip -ur $@ $</build

.PHONY:
final.zip: final neon-matrix
	git archive HEAD -o $@ $?
	zip -ur $@ $</build


.PHONY:
clean:
	rm -rf *.zip
