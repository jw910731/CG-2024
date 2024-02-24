QUIZES = $(shell ls -d quiz*/ | sed 's/\///g' | awk 'NF{print $$0 ".zip"}')

.PHONY:
all: $(QUIZES)

.PHONY:
quiz%.zip: quiz%
	git archive HEAD -o $@ $<

.PHONY:
clean:
	rm -rf *.zip
